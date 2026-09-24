const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/database');
const { issueAccessToken } = require('../src/system/auth').service;

test('答题活动、作答进度与结果均通过后端持久化', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const userId = `quiz-test-${randomUUID()}`;
  const token = issueAccessToken({ userId, roles: ['citizen'] });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, options = {}) => {
    const response = await fetch(`${origin}/api/quiz${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    return { status: response.status, ...(await response.json()) };
  };

  try {
    assert.equal((await request('/read', { headers: { Authorization: '' } })).status, 401);
    const initial = await request('/read');
    assert.equal(initial.status, 200);
    assert.ok(initial.data.events.length >= 4);
    assert.match(initial.data.events[0].imageUrl, /^\/api\/quiz\/assets\//);
    assert.equal(initial.data.events[0].questions[0].correct, undefined);

    const image = await fetch(`${origin}${initial.data.events[0].imageUrl}`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /^image\//);

    const activity = initial.data.events.find((event) => event.id === 'city');
    const started = await request('/start', { method: 'POST', body: JSON.stringify({ id: activity.id }) });
    assert.equal(started.status, 200);
    assert.equal(started.data.attempt.status, 'active');

    const answered = await request('/answer', { method: 'POST', body: JSON.stringify({ id: activity.id, index: 0, choices: [1] }) });
    assert.equal(answered.status, 200);
    assert.equal(answered.data.attempt.answers[0].correct, true);
    assert.deepEqual(answered.data.questions[0].correct, [1]);

    const advanced = await request('/next', { method: 'POST', body: JSON.stringify({ id: activity.id, index: 0 }) });
    assert.equal(advanced.status, 200);
    assert.equal(advanced.data.attempt.index, 1);
    assert.equal((await request('/read')).data.events.find((event) => event.id === activity.id).attempt.index, 1);
  } finally {
    await db.quizAnswer.deleteMany({ where: { attempt: { userId } } }).catch(() => {});
    await db.quizAttempt.deleteMany({ where: { userId } }).catch(() => {});
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
