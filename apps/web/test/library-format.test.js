import test from 'node:test';
import assert from 'node:assert/strict';
import * as libraryFormat from '../src/modules/library/utils/format.js';

const { formatLibraryDate, daysUntil } = libraryFormat;

test('图书馆日期按海安本地时间展示并正确计算剩余天数', () => {
  assert.equal(formatLibraryDate('2026-09-26T06:00:00.000Z'), '9月26日');
  assert.equal(daysUntil('2026-09-20T10:00:00.000Z', new Date('2026-09-17T10:00:00.000Z')), 3);
});

test('活动页分类标签会筛选真实活动数据并生成分栏日期', () => {
  assert.equal(typeof libraryFormat.filterLibraryEvents, 'function');
  assert.equal(typeof libraryFormat.formatLibraryEventDate, 'function');

  const events = [
    { id: '1', category: '读书会' },
    { id: '2', category: '亲子阅读' },
    { id: '3', category: '地方文献' },
  ];
  assert.deepEqual(libraryFormat.filterLibraryEvents(events, '全部活动'), events);
  assert.deepEqual(libraryFormat.filterLibraryEvents(events, '亲子阅读'), [events[1]]);
  assert.deepEqual(libraryFormat.formatLibraryEventDate('2026-09-26T06:00:00.000Z'), {
    year: '2026', month: '09', day: '26', weekday: '周六', time: '14:00',
  });
});
