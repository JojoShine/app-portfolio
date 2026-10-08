// 仅用于 CI 的隔离数据库；检查业务原件存在，不连接或上传 OSS。
const fs = require('node:fs/promises');
const db = require('../src/config/database');
const { runSeeds } = require('../prisma/seed');

runSeeds(db, [], {
  assetStore: {
    uploadFile: async ({ sourcePath }) => {
      const file = await fs.stat(sourcePath);
      if (!file.isFile() || !file.size) throw new Error('初始化业务资源缺失');
    },
  },
}).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => db.$disconnect());
