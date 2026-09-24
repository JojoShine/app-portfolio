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
    await prisma.$transaction((tx) => moduleSeed.seedData(tx), { timeout: 60000 });
    if (moduleSeed.seedAssets) {
      if (!assetStore) throw new Error(`${name} 初始化需要资源存储配置`);
      await moduleSeed.seedAssets(assetStore);
    }
    console.log(`已初始化 ${name}（保留已有记录）`);
  }
}

function createMinioAssetStore() {
  const fs = require('node:fs');
  const storage = require('../src/config/minio');
  let ready;
  return { uploadFile: async ({ objectKey, sourcePath, mimeType }) => {
    ready ||= storage.ensurePrivateBucket();
    await ready;
    const stat = await fs.promises.stat(sourcePath);
    return storage.getMinioClient().putObject(
      storage.bucket,
      objectKey,
      fs.createReadStream(sourcePath),
      stat.size,
      { 'Content-Type': mimeType },
    );
  } };
}

async function main() {
  const names = selectModules(process.argv.slice(2));
  require('dotenv').config({ path: ['.env', '.env.example'], quiet: true });
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try { await runSeeds(prisma, names, { assetStore: createMinioAssetStore() }); } finally { await prisma.$disconnect(); }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { selectModules, runSeeds, createMinioAssetStore };
