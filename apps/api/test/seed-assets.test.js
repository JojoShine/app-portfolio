const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

for (const name of ['library', 'green-points', 'quiz']) {
  test(`${name} 的初始化图片来自后端，且不上传页面装饰`, async () => {
    const uploads = [];
    await require(`../prisma/seed/${name}`).seedAssets({ uploadFile: async asset => {
      const root = path.resolve(__dirname, '../prisma/seed/assets', name) + path.sep;
      assert.ok(asset.sourcePath.startsWith(root), '初始化不得依赖前端源码目录');
      assert.ok((await fs.stat(asset.sourcePath)).size > 0);
      uploads.push(asset.objectKey);
    } });
    for (const decoration of ['library-hero', 'library-paper', 'library-ink-landscape', 'home-points-card', 'home-lifestyle-banner', 'celebration', 'review-overview', 'avatars']) {
      assert.ok(!uploads.some(key => key.includes(decoration)), `${decoration} 应随前端发布`);
    }
    assert.ok(uploads.length > 0);
    const records = new Map();
    const database = new Proxy({}, { get: (_, model) => ({ upsert: async ({create}) => {
      if (!records.has(model)) records.set(model, []);
      records.get(model).push(create);
      return create;
    } }) });
    await require(`../prisma/seed/${name}`).seedData(database);
    if (name === 'library') {
      for (const model of ['libraryBranch','libraryBook','libraryEvent']) {
        for (const row of records.get(model)) assert.ok(uploads.includes(row.imagePath || row.coverPath), `${model} 的图片未初始化`);
      }
    } else {
      const prefix = name === 'quiz' ? 'quiz' : 'greenPoints';
      const assets = new Map(records.get(prefix + 'Asset').map(row => [row.id,row.objectKey]));
      for (const rows of records.values()) for (const row of rows) {
        for (const field of ['imageAssetId','thumbnailAssetId']) if (row[field]) assert.ok(uploads.includes(assets.get(row[field])), `${field} 指向未初始化图片`);
      }
    }
  });
}
