const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const withTimezone = (connectionString) => {
  if (!/^postgres(?:ql)?:\/\//i.test(connectionString)) return connectionString;
  if (/[?&]options=/i.test(connectionString)) return connectionString;
  const separator = connectionString.includes('?') ? '&' : '?';
  const options = encodeURIComponent(`-c timezone=${env.DB_TIMEZONE}`);
  return `${connectionString}${separator}options=${options}`;
};

const buildDatabaseUrl = () => {
  if (env.DATABASE_URL) return withTimezone(env.DATABASE_URL);

  const username = encodeURIComponent(env.DB_USER);
  const password = encodeURIComponent(env.DB_PASSWORD || '');
  const database = encodeURIComponent(env.DB_NAME);
  return withTimezone(
    `postgresql://${username}:${password}@${env.DB_HOST}:${env.DB_PORT}/${database}?schema=public`
  );
};

const globalDatabase = globalThis;
const database = globalDatabase.__appPortfolioPrisma || new PrismaClient({
  datasourceUrl: buildDatabaseUrl(),
  log: env.DB_LOGGING ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

if (env.NODE_ENV !== 'production') {
  globalDatabase.__appPortfolioPrisma = database;
}

module.exports = database;
