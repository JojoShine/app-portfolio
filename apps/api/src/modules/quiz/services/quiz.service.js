const db = require('../../../config/database');
const storage = require('../../../config/minio');
const { ValidationError, NotFoundError, ConflictError } = require('../../../common/utils/error');

const assetUrl = (id) => `/api/quiz/assets/${encodeURIComponent(id)}`;
const fail = (message) => { throw new ValidationError(message); };
const includes = {
  questions: { orderBy: { position: 'asc' } },
  attempts: { include: { answers: { orderBy: { position: 'asc' } } } },
  rankingEntries: true,
};

const syncTimeouts = (userId, now) => db.quizAttempt.updateMany({
  where: { userId, status: 'active', deadline: { lte: now } },
  data: { status: 'completed', finishedAt: now, reason: 'timeout' },
});

const score = (attempt, count) => Math.round(attempt.answers.filter((answer) => answer.correct).length * 100 / count);

const ranking = (activity, attempt) => {
  const rows = activity.rankingEntries.map((entry) => ({
    id: `demo-${entry.avatarIndex}`,
    name: entry.displayName,
    score: entry.score,
    seconds: entry.seconds,
  }));
  if (attempt?.status === 'completed') rows.push({
    id: 'me', name: '我', score: score(attempt, activity.questions.length),
    seconds: Math.max(0, Math.ceil((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000)),
  });
  return rows
    .sort((left, right) => right.score - left.score || left.seconds - right.seconds || left.id.localeCompare(right.id))
    .map((row, index) => ({ ...row, rank: index + 1 }));
};

const presentActivity = (activity, userId) => {
  const attempt = activity.attempts.find((item) => item.userId === userId) || null;
  const rows = ranking(activity, attempt);
  const answers = attempt?.answers.map((answer) => ({
    choices: answer.choices, correct: answer.correct, time: answer.answeredAt.getTime(),
  })) || [];
  const attemptView = attempt ? {
    status: attempt.status,
    startedAt: attempt.startedAt.getTime(),
    deadline: attempt.deadline.getTime(),
    finishedAt: attempt.finishedAt?.getTime() || null,
    reason: attempt.reason,
    index: attempt.currentIndex,
    answers,
    score: score(attempt, activity.questions.length),
    correctCount: answers.filter((answer) => answer.correct).length,
    rank: rows.find((row) => row.id === 'me')?.rank,
  } : null;
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    type: activity.type,
    count: activity.questions.length,
    minutes: activity.minutes,
    start: activity.startsAt.getTime(),
    end: activity.endsAt.getTime(),
    imageUrl: assetUrl(activity.imageAssetId),
    thumbnailUrl: assetUrl(activity.thumbnailAssetId),
    attempt: attemptView,
    ranking: rows,
    questions: activity.questions.map((question) => {
      const revealed = attempt?.status === 'completed' || answers[question.position];
      return {
        type: question.type,
        title: question.title,
        options: question.options,
        ...(revealed ? { correct: question.correct, explanation: question.explanation } : {}),
      };
    }),
  };
};

const findActivity = async (userId, id) => {
  const activity = await db.quizActivity.findFirst({
    where: { id, active: true },
    include: {
      ...includes,
      attempts: { where: { userId }, include: { answers: { orderBy: { position: 'asc' } } } },
    },
  });
  if (!activity) throw new NotFoundError('活动不存在');
  return activity;
};

const currentAttempt = async (tx, userId, activityId) => {
  const attempt = await tx.quizAttempt.findUnique({
    where: { userId_activityId: { userId, activityId } },
    include: {
      answers: { orderBy: { position: 'asc' } },
      activity: { include: { questions: { orderBy: { position: 'asc' } } } },
    },
  });
  if (!attempt) throw new ValidationError('请先开始挑战');
  const now = new Date();
  if (attempt.status === 'active' && attempt.deadline <= now) {
    await tx.quizAttempt.update({ where: { id: attempt.id }, data: { status: 'completed', finishedAt: attempt.deadline, reason: 'timeout' } });
    attempt.status = 'completed';
    attempt.finishedAt = attempt.deadline;
    attempt.reason = 'timeout';
  }
  return attempt;
};

exports.read = async (userId) => {
  const now = new Date();
  await syncTimeouts(userId, now);
  const activities = await db.quizActivity.findMany({
    where: { active: true }, orderBy: { sort: 'asc' },
    include: {
      ...includes,
      attempts: { where: { userId }, include: { answers: { orderBy: { position: 'asc' } } } },
    },
  });
  if (!activities.length) throw new ConflictError('答题活动尚未初始化');
  return {
    events: activities.map((activity) => presentActivity(activity, userId)),
    serverNow: now.getTime(),
  };
};

exports.start = async (userId, id) => {
  if (!id) fail('缺少活动编号');
  const activity = await findActivity(userId, id);
  const existing = activity.attempts[0];
  if (!existing) {
    const now = new Date();
    if (now < activity.startsAt) fail('活动还未开始');
    if (now >= activity.endsAt) fail('活动已结束');
    const deadline = new Date(Math.min(now.getTime() + activity.minutes * 60000, activity.endsAt.getTime()));
    try {
      await db.quizAttempt.create({ data: { userId, activityId: id, deadline } });
    } catch (error) {
      if (error.code !== 'P2002') throw error;
    }
  }
  return presentActivity(await findActivity(userId, id), userId);
};

exports.answer = async (userId, { id, index, choices }) => {
  if (!id) fail('缺少活动编号');
  await db.$transaction(async (tx) => {
    const attempt = await currentAttempt(tx, userId, id);
    if (attempt.status === 'completed') return;
    if (!Number.isInteger(index) || index !== attempt.currentIndex) fail('题目已更新，请继续当前题目');
    if (attempt.answers.some((answer) => answer.position === index)) return;
    const question = attempt.activity.questions[index];
    if (!question) throw new NotFoundError('题目不存在');
    if (!Array.isArray(choices) || !choices.length || choices.some((choice) => !Number.isInteger(choice) || choice < 0 || choice >= question.options.length) || new Set(choices).size !== choices.length || (question.type !== 'multi' && choices.length !== 1)) fail('请选择有效答案');
    const correct = choices.length === question.correct.length && question.correct.every((choice) => choices.includes(choice));
    const now = new Date();
    await tx.quizAnswer.create({ data: { attemptId: attempt.id, questionId: question.id, position: index, choices, correct, answeredAt: now } });
    if (index === attempt.activity.questions.length - 1) {
      await tx.quizAttempt.update({ where: { id: attempt.id }, data: { status: 'completed', finishedAt: now, reason: 'answered' } });
    }
  }, { isolationLevel: 'Serializable' });
  return presentActivity(await findActivity(userId, id), userId);
};

exports.next = async (userId, { id, index }) => {
  if (!id) fail('缺少活动编号');
  await db.$transaction(async (tx) => {
    const attempt = await currentAttempt(tx, userId, id);
    if (attempt.status !== 'active' || index !== attempt.currentIndex) return;
    if (!attempt.answers.some((answer) => answer.position === index)) fail('请先完成当前题目');
    await tx.quizAttempt.update({ where: { id: attempt.id }, data: { currentIndex: { increment: 1 } } });
  }, { isolationLevel: 'Serializable' });
  return presentActivity(await findActivity(userId, id), userId);
};

exports.asset = async (id) => {
  const asset = await db.quizAsset.findUnique({ where: { id } });
  if (!asset) throw new NotFoundError('答题资源不存在');
  await storage.ensurePrivateBucket();
  return { stream: await storage.getMinioClient().getObject(storage.bucket, asset.objectKey), mimeType: asset.mimeType };
};
