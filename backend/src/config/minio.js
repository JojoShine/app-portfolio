const { Client } = require('minio');
const env = require('./env');

const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

// 添加bucket属性
minioClient.bucket = env.MINIO_BUCKET;

module.exports = minioClient;

