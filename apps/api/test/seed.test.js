const test = require('node:test');
const assert = require('node:assert/strict');
const { selectModules, runSeeds } = require('../prisma/seed');

// 内存 Prisma 替身：仅允许为空的新增规则补默认值，不接触开发数据库。
function isolatedDatabase() {
  const tables = new Map();
  const database = new Proxy({}, { get(_, model) {
    if (model === '$transaction') return (callback) => callback(database);
    if (!tables.has(model)) tables.set(model, new Map());
    return {
      findUnique: async ({where}) => tables.get(model).get(JSON.stringify(where)) || null,
      update: async ({where,data}) => {
        const row=tables.get(model).get(JSON.stringify(where));
        assert.equal(model,'policyDefinition');
        assert.deepEqual(Object.keys(data),['benefitRules']);
        assert.deepEqual(row.benefitRules || {},{});
        Object.assign(row,structuredClone(data));
        return row;
      },
      findMany: async ({where} = {}) => [...tables.get(model).values()].filter(row => Object.entries(where || {}).every(([key,value]) => row[key] === value)), upsert: async ({ where, update, create }) => {
      assert.deepEqual(update, {}, `${model} 不应覆盖已有数据`);
      const table = tables.get(model);
      const key = JSON.stringify(where);
      if (!table.has(key)) table.set(key, structuredClone(create));
      return table.get(key);
    } };
  } });
  return { database, tables };
}

function isolatedAssetStore() {
  const uploads = [];
  return {
    uploads,
    store: { uploadFile: async (asset) => uploads.push({
      objectKey: asset.objectKey,
      filename: require('node:path').basename(asset.sourcePath),
      mimeType: asset.mimeType,
    }) },
  };
}

test('种子入口严格校验模块并去重，默认包含所有已建后端模块', () => {
  assert.deepEqual(selectModules(), ['policy-match', 'system', 'enrollment', 'library', 'coupon', 'snap-report', 'green-points', 'quiz']);
  assert.deepEqual(selectModules(['coupon', 'coupon']), ['coupon']);
  assert.deepEqual(selectModules(['quiz', 'quiz']), ['quiz']);
  assert.throws(() => selectModules(['constructor']), /未知 seed 模块/);
});

test('政策初始化只补充空的重复享受规则，保留已配置规则',async()=>{
  const {database,tables}=isolatedDatabase();
  await runSeeds(database,['policy-match']);
  const rows=tables.get('policyDefinition');
  rows.get(JSON.stringify({id:'youth'})).benefitRules={};
  rows.get(JSON.stringify({id:'housing'})).benefitRules={source:'用户已配置'};
  await runSeeds(database,['policy-match']);
  assert.equal(rows.get(JSON.stringify({id:'youth'})).benefitRules.stacking,'exclusive');
  assert.deepEqual(rows.get(JSON.stringify({id:'housing'})).benefitRules,{source:'用户已配置'});
});

for (const module of selectModules()) {
  test(`${module} 重复初始化幂等并保留用户修改`, async () => {
    const { database, tables } = isolatedDatabase();
    const { store, uploads } = isolatedAssetStore();
    await runSeeds(database, [module], { assetStore: store });
    assert.ok(tables.size > 0);
    const firstTable = tables.values().next().value;
    firstTable.values().next().value.userEdit = '保留用户资料';
    const snapshot = structuredClone(tables);
    await runSeeds(database, [module], { assetStore: store });
    assert.deepEqual(tables, snapshot);
    if (module === 'coupon') {
      assert.equal(tables.get('couponActivity').size, 4);
      assert.equal(tables.get('couponTicket').size, 4);
      assert.equal(tables.get('couponMerchant').size, 4);
    }
    if (module === 'enrollment') assert.equal(tables.get('enrollmentDepartmentRecord').size, 5);
    if (module === 'green-points') {
      assert.equal(tables.get('greenPointsProduct').size, 16);
      assert.equal(tables.get('greenPointsAsset').size, 6);
      assert.equal(uploads.length, 12);
      assert.deepEqual(uploads.slice(0, 2), [
        { objectKey: 'green-points/cup.png', filename: 'cup.png', mimeType: 'image/png' },
        { objectKey: 'green-points/bag.png', filename: 'bag.png', mimeType: 'image/png' },
      ]);
    }
    if (module === 'quiz') {
      assert.equal(tables.get('quizActivity').size, 4);
      assert.equal(tables.get('quizQuestion').size, 65);
      assert.equal(tables.get('quizAsset').size, 6);
      assert.equal(uploads.length, 12);
      assert.deepEqual(uploads.slice(0, 2), [
        { objectKey: 'quiz/city.png', filename: 'city.png', mimeType: 'image/png' },
        { objectKey: 'quiz/topics.png', filename: 'topics.png', mimeType: 'image/png' },
      ]);
    }
    if (module === 'library') {
      assert.equal(uploads.length, 10);
      assert.deepEqual(uploads.slice(0, 2), [
        { objectKey: 'library/reading-circle.png', filename: 'reading-circle.png', mimeType: 'image/png' },
        { objectKey: 'library/branch-interior.png', filename: 'branch-interior.png', mimeType: 'image/png' },
      ]);
    }
    if (module === 'snap-report') {
      const report = tables.get('snapReport').values().next().value;
      assert.equal(report.userId, 'demo-snap-report');
      assert.match(report.content.description, /虚构演示/);
      assert.equal(tables.has('snapReportPhoto'), false);
      assert.equal(tables.has('snapAnalysis'), false);
    }
  });
}
