import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const moduleUrl = new URL('../src/modules/library/', import.meta.url);
const read = (path) => readFileSync(new URL(path, moduleUrl), 'utf8');

test('图书馆样式入口按页面域拆分且不加载备份文件', () => {
  const entry = read('styles/index.css');
  const pagesEntry = read('styles/pages.css');
  assert.match(entry, /@import '\.\/pages\.css';/);
  assert.doesNotMatch(entry + pagesEntry, /library\.css(?:\.bak)?/);
  assert.doesNotMatch(pagesEntry, /\{[^}]*\}/s);
  for (const name of ['home', 'catalog', 'services', 'events', 'profile']) {
    assert.match(pagesEntry, new RegExp(`@import './pages/${name}\\.css';`));
  }
});

test('页面查询通过领域 Hook 调用，Service 保持纯请求层', () => {
  const pages = readdirSync(new URL('pages/', moduleUrl)).filter((name) => name.endsWith('.jsx'));
  for (const page of pages) assert.doesNotMatch(read(`pages/${page}`), /hooks\/useLibraryQuery/);

  for (const hook of ['useCatalogData.js', 'useEventData.js', 'useReaderData.js']) {
    const source = read(`hooks/${hook}`);
    assert.match(source, /from '\.\/useLibraryQuery'/);
    assert.match(source, /from '\.\.\/services\/library\.service'/);
  }

  assert.match(read('hooks/useSeatData.js'), /getSeatAvailability/);
  assert.doesNotMatch(read('pages/SeatSelectionPage.jsx'), /getSeatAvailability|useEffect/);

  const service = read('services/library.service.js');
  assert.doesNotMatch(service, /from 'react'|useState|useEffect/);
});
