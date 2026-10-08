'use strict';

const modules = {
  'policy-match': () => ({ seedData: require('./seed/policy-match').seedPolicyMatch }),
  system: () => ({ seedData: require('./seed/system').seedSystem }),
  enrollment: () => ({ seedData: require('./seed/enrollment').seedEnrollment }),
  library: () => require('./seed/library'),
  coupon: () => ({ seedData: require('./seed/coupon').seedCoupon }),
  'snap-report': () => ({ seedData: require('./seed/snap-report').seedSnapReport }),
  'green-points': () => require('./seed/green-points'),
  quiz: () => require('./seed/quiz'),
};

function selectModules(args = []) {
  const names = args.length ? args : Object.keys(modules);
  for (const name of names) {
    if (!Object.hasOwn(modules, name)) throw new Error(`未知 seed 模块：${name}。可用模块：${Object.keys(modules).join(', ')}`);
  }
  return [...new Set(names)];
}

async function runSeeds(prisma, names, { assetStore } = {}) {
  for (const name of selectModules(names)) {
    const moduleSeed = modules[name]();
    if (moduleSeed.seedAssets) {
      if (!assetStore) throw new Error(`${name} 初始化需要资源存储配置`);
      await moduleSeed.seedAssets(assetStore);
    }
    await prisma.$transaction((tx) => moduleSeed.seedData(tx), { timeout: 60000 });
    console.log(`已初始化 ${name}（保留已有记录）`);
  }
}

function createOssAssetStore() {
  const storage = require('../src/config/oss');
  return { uploadFile: ({ objectKey, sourcePath, mimeType }) =>
    storage.putFileIfMissing(objectKey, sourcePath, mimeType) };
}

async function main() {
  const names = selectModules(process.argv.slice(2));
  const env = require('../src/config/env');
  env.validate();
  const prisma = require('../src/config/database');
  try { await runSeeds(prisma, names, { assetStore: createOssAssetStore() }); } finally { await prisma.$disconnect(); }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { selectModules, runSeeds, createOssAssetStore };
