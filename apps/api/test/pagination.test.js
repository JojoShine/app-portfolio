const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePagination } = require('../src/common/utils/pagination');

test('pagination clamps hostile and oversized values', () => {
  assert.deepEqual(parsePagination({ page: '-3', pageSize: '100000' }), {
    page: 1,
    pageSize: 100,
  });
});
