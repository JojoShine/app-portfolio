const { Client } = require('minio');
const env = require('./env');
const { ServiceUnavailableError } = require('../common/utils/error');

let client;
let bucketReady;

const getMinioClient = () => {
  if (!env.FILE_STORAGE_ENABLED) {
    throw new ServiceUnavailableError('File storage is not enabled');
  }

  if (!client) {
    client = new Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }

  return client;
};

const ensurePrivateBucket = async () => {
  const minioClient = getMinioClient();
  if (!bucketReady) {
    bucketReady = (async () => {
      const exists = await minioClient.bucketExists(env.MINIO_BUCKET);
      if (!exists) await minioClient.makeBucket(env.MINIO_BUCKET, 'us-east-1');
      return true;
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  return bucketReady;
};

module.exports = {
  bucket: env.MINIO_BUCKET,
  getMinioClient,
  ensurePrivateBucket,
};
