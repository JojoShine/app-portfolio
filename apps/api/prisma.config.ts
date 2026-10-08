import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: process.env.NODE_ENV === 'production' ? ['.env'] : ['.env', '.env.example'], quiet: true });

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
