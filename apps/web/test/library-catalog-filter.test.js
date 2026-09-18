import test from 'node:test';
import assert from 'node:assert/strict';
import { updateCatalogParams } from '../src/modules/library/utils/catalogFilters.js';

test('馆藏筛选参数会保留其他查询并删除已清空选项', () => {
  const current = new URLSearchParams('q=汪曾祺&branchId=old&availability=available');
  const next = updateCatalogParams(current, { branchId: 'haian-main', availability: '', sort: 'newest' });

  assert.equal(next.get('q'), '汪曾祺');
  assert.equal(next.get('branchId'), 'haian-main');
  assert.equal(next.has('availability'), false);
  assert.equal(next.get('sort'), 'newest');
});

test('馆藏搜索清空后不保留空的 q 参数', () => {
  const next = updateCatalogParams(new URLSearchParams('q=汪曾祺&sort=newest'), { q: '' });

  assert.equal(next.has('q'), false);
  assert.equal(next.get('sort'), 'newest');
});
