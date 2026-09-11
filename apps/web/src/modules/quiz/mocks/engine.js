import { questions } from './questions';
const DAY = 86400000;
export function createState() {
  const base = Date.now();
  return { version: 1, base, attempts: {} };
}
export function events(state) {
  return [
    { id: 'city', title: '城市知识挑战', description: '探索身边的知识，发现城市的精彩', type: 'city', count: 20, minutes: 15, start: state.base - DAY, end: state.base + 10 * DAY },
    { id: 'science', title: '生活科学知多少', description: '生活里的小发现，藏着有趣的大知识', type: 'science', count: 15, minutes: 10, start: state.base - DAY, end: state.base + 7 * DAY },
    { id: 'culture', title: '传统文化趣味答题', description: '走近文化之美，寻找时光中的智慧', type: 'culture', count: 20, minutes: 15, start: state.base + 3 * DAY, end: state.base + 12 * DAY },
    { id: 'safety', title: '安全知识小挑战', description: '把安全记在心里，让生活更安心', type: 'safety', count: 10, minutes: 8, start: state.base - 10 * DAY, end: state.base - DAY },
  ];
}
function finish(attempt, time, reason) { attempt.status = 'completed'; attempt.finishedAt = time; attempt.reason = reason; }
function sync(state, now) {
  Object.values(state.attempts).forEach(a => { if (a.status === 'active' && now >= a.deadline) finish(a, a.deadline, 'timeout'); });
}
function deck(event) {
  const offset = event.id === 'science' ? 5 : 0;
  return Array.from({ length: event.count }, (_, i) => questions[(i + offset) % questions.length]);
}
function score(a, event) { return Math.round(a.answers.filter(v => v?.correct).length * 100 / event.count); }
function ranks(a, event) {
  const names = ['小禾', '晴天', '木木', '阿星', '林间风', '小满', '向日葵', '远山', '星河', '小鹿', '晨光', '听风', '阿橙', '北北', '南山'];
  const rows = names.map((name, i) => ({ id: `demo-${i}`, name, score: Math.max(0, 100 - Math.floor(i / 2) * 5), seconds: 210 + (i % 2) * 35 + Math.floor(i / 2) * 13 }));
  if (a?.status === 'completed') rows.push({ id: 'me', name: '我', score: score(a, event), seconds: Math.ceil((a.finishedAt - a.startedAt) / 1000) });
  return rows.sort((x, y) => y.score - x.score || x.seconds - y.seconds || x.id.localeCompare(y.id)).map((r, i) => ({ ...r, rank: i + 1 }));
}
function view(state, event) {
  const a = state.attempts[event.id];
  const qs = deck(event);
  const ranking = ranks(a, event);
  const attempt = a ? { ...a, score: score(a, event), correctCount: a.answers.filter(v => v?.correct).length, rank: ranking.find(r => r.id === 'me')?.rank } : null;
  return { ...event, attempt, ranking, questions: qs.map((q, i) => {
    const revealed = a?.status === 'completed' || Boolean(a?.answers[i]);
    return { type: q.type, title: q.title, options: q.options, ...(revealed ? { correct: q.correct, explanation: q.explanation } : {}) };
  }) };
}
export function dispatch(state, action, body = {}) {
  const now = Date.now();
  sync(state, now);
  const all = events(state);
  if (action === 'read') return { events: all.map(e => view(state, e)), serverNow: now };
  const e = all.find(e => e.id === body.id);
  if (!e) throw new Error('活动不存在');
  let a = state.attempts[e.id];
  if (action === 'start') {
    if (a) return view(state, e);
    if (now < e.start) throw new Error('活动还未开始');
    if (now >= e.end) throw new Error('活动已结束');
    a = state.attempts[e.id] = { status: 'active', startedAt: now, deadline: Math.min(now + e.minutes * 60000, e.end), index: 0, answers: [] };
  } else if (action === 'answer') {
    if (!a) throw new Error('请先开始挑战');
    if (a.status === 'completed') return view(state, e);
    if (body.index !== a.index) throw new Error('题目已更新，请继续当前题目');
    if (a.answers[a.index]) return view(state, e);
    const q = deck(e)[a.index];
    const choices = body.choices;
    if (!Array.isArray(choices) || !choices.length || choices.some(n => !Number.isInteger(n) || n < 0 || n >= q.options.length) || new Set(choices).size !== choices.length || (q.type !== 'multi' && choices.length !== 1)) throw new Error('请选择有效答案');
    const correct = choices.length === q.correct.length && q.correct.every(n => choices.includes(n));
    a.answers[a.index] = { choices, correct, time: now };
    if (a.index === e.count - 1) finish(a, now, 'answered');
  } else if (action === 'next') {
    if (!a) throw new Error('请先开始挑战');
    if (a.status !== 'completed' && a.index === body.index && a.answers[a.index]) a.index += 1;
  } else throw new Error('操作不存在');
  return view(state, e);
}
