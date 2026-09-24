const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../src/modules/library/domain/rules');
const validation = require('../src/modules/library/validations/library.validation');
const app = require('../src/app');

const withServer = async (run) => {
  const server = app.listen(0);
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('馆藏查询会规范分页并拒绝非法筛选值', () => {
  assert.deepEqual(validation.bookQuery({ q: ' 汪曾祺 ', page: '2', pageSize: '20', availability: 'available' }), {
    q: '汪曾祺',
    page: 2,
    pageSize: 20,
    availability: 'available',
    branchId: undefined,
    category: undefined,
    sort: 'relevance',
  });
  assert.throws(() => validation.bookQuery({ pageSize: '101' }), /每页数量/);
  assert.throws(() => validation.bookQuery({ availability: 'unknown' }), /馆藏状态/);
  try {
    validation.bookQuery({ pageSize: '101' });
    assert.fail('应拒绝非法分页');
  } catch (error) {
    assert.equal(error.code, 1001);
    assert.equal(error.statusCode, 400);
  }
});

test('续借规则返回新到期日并拒绝逾期、达到次数或存在预约的借阅', () => {
  const dueAt = new Date('2026-09-20T10:00:00.000Z');
  assert.equal(
    rules.getRenewedDueAt({ dueAt, renewalCount: 0, readerStatus: 'active', hasQueue: false }, new Date('2026-09-17T10:00:00.000Z')).toISOString(),
    '2026-10-20T10:00:00.000Z'
  );
  assert.throws(() => rules.getRenewedDueAt({ dueAt, renewalCount: 0, readerStatus: 'active', hasQueue: false }, new Date('2026-09-21T10:00:00.000Z')), /逾期/);
  assert.throws(() => rules.getRenewedDueAt({ dueAt, renewalCount: 1, readerStatus: 'active', hasQueue: false }), /续借次数/);
  assert.throws(() => rules.getRenewedDueAt({ dueAt, renewalCount: 0, readerStatus: 'active', hasQueue: true }), /预约/);
});

test('不可续借状态会返回明确原因', () => {
  const now = new Date('2026-09-21T10:00:00.000Z');
  assert.equal(rules.getRenewalBlockReason({ status: 'borrowed', dueAt: new Date('2026-09-25T10:00:00.000Z'), renewalCount: 1, readerStatus: 'active', hasQueue: false }, now), '已达到续借次数上限');
  assert.equal(rules.getRenewalBlockReason({ status: 'borrowed', dueAt: new Date('2026-09-25T10:00:00.000Z'), renewalCount: 0, readerStatus: 'active', hasQueue: true }, now), '已有其他读者预约');
  assert.equal(rules.getRenewalBlockReason({ status: 'overdue', dueAt: new Date('2026-09-20T10:00:00.000Z'), renewalCount: 0, readerStatus: 'active', hasQueue: false }, now), '图书已逾期');
});

test('座位预约拒绝重叠时段但允许首尾相接', () => {
  const active = [{ startsAt: new Date('2026-09-18T06:00:00.000Z'), endsAt: new Date('2026-09-18T09:00:00.000Z') }];
  assert.equal(rules.hasTimeConflict(active, new Date('2026-09-18T08:00:00.000Z'), new Date('2026-09-18T10:00:00.000Z')), true);
  assert.equal(rules.hasTimeConflict(active, new Date('2026-09-18T09:00:00.000Z'), new Date('2026-09-18T11:00:00.000Z')), false);
});

test('真实图书馆 API 返回馆藏并隔离读者资料', async () => {
  await withServer(async (baseUrl) => {
    const booksResponse = await fetch(`${baseUrl}/api/library/books?q=人间`);
    assert.equal(booksResponse.status, 200);
    const books = await booksResponse.json();
    assert.equal(books.code, 0);
    assert.equal(books.data.items[0].title, '人间草木');

    const profileWithoutToken = await fetch(`${baseUrl}/api/library/profile`);
    assert.equal(profileWithoutToken.status, 401);
  });
});
