const path = require('path');
require('dotenv').config({
  path: [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.example'),
  ],
  quiet: true,
});

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return value === 'true';
};

const toNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 3000),
  TRUST_PROXY_HOPS: Math.max(0, toNumber(process.env.TRUST_PROXY_HOPS, 0)),

  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: toNumber(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME || 'app_portfolio',
  DB_USER: process.env.DB_USER || 'app_portfolio',
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_LOGGING: toBoolean(process.env.DB_LOGGING),
  DB_TIMEZONE: process.env.DB_TIMEZONE || 'Asia/Shanghai',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER || 'app-portfolio',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'app-portfolio-api',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  ENABLE_DEV_AUTH: toBoolean(process.env.ENABLE_DEV_AUTH),
  DEV_AUTH_SECRET: process.env.DEV_AUTH_SECRET,

  FILE_STORAGE_ENABLED: toBoolean(process.env.FILE_STORAGE_ENABLED),
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: toNumber(process.env.MINIO_PORT, 9000),
  MINIO_USE_SSL: toBoolean(process.env.MINIO_USE_SSL),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET: process.env.MINIO_BUCKET || 'app-portfolio',

  ENROLLMENT_DATA_KEY: process.env.ENROLLMENT_DATA_KEY,

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (!process.env.TZ) process.env.TZ = env.DB_TIMEZONE;

env.validate = () => {
  const errors = [];

  if (!env.DATABASE_URL && !env.DB_PASSWORD) {
    errors.push('DATABASE_URL or DB_PASSWORD is required');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters');
  }
  if (env.NODE_ENV === 'production' && env.ENABLE_DEV_AUTH) {
    errors.push('ENABLE_DEV_AUTH must be false in production');
  }
  if (env.ENABLE_DEV_AUTH && (!env.DEV_AUTH_SECRET || env.DEV_AUTH_SECRET.length < 16)) {
    errors.push('DEV_AUTH_SECRET must contain at least 16 characters when development auth is enabled');
  }
  if (env.NODE_ENV === 'production' && env.CORS_ORIGINS.includes('*')) {
    errors.push('CORS_ORIGINS cannot contain * in production');
  }
  if (env.NODE_ENV === 'production' && (!env.ENROLLMENT_DATA_KEY || env.ENROLLMENT_DATA_KEY.length < 32)) {
    errors.push('ENROLLMENT_DATA_KEY must contain at least 32 characters in production');
  }
  if (env.FILE_STORAGE_ENABLED) {
    for (const key of ['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY']) {
      if (!env[key]) errors.push(`${key} is required when file storage is enabled`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }
};

module.exports = env;
