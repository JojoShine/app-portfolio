const test = require('node:test');
const assert = require('node:assert/strict');
const { validateApp } = require('../src/system/app').validation;

test('app validation only returns allowed fields', () => {
  const value = validateApp({
    name: 'Sample',
    description: 'Sample application',
    path: '/sample',
    categoryId: 'category-id',
    status: 'developing',
    injected: true,
  });

  assert.equal(value.injected, undefined);
  assert.equal(value.path, '/sample');
});

test('app validation rejects external URLs', () => {
  assert.throws(
    () => validateApp({ name: 'Unsafe', path: 'https://example.com', categoryId: 'category-id' }),
    { name: 'ValidationError' }
  );
});
