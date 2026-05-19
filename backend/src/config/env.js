require('dotenv').config();

const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Database
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // MinIO
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: process.env.MINIO_PORT || 9000,
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET: process.env.MINIO_BUCKET || 'app-portfolio',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_HOST',
  'REDIS_PASSWORD',
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
];

const missingEnvVars = requiredEnvVars.filter(key => !env[key]);
if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = env;