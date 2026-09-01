const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const database = require('../src/config/database');

test('Prisma client exposes the generated system and enrollment delegates', () => {
  for (const delegate of ['user', 'file', 'category', 'app', 'enrollmentApplication']) {
    assert.equal(typeof database[delegate].findMany, 'function');
  }
});

test('Sharp can process an in-memory image after the security upgrade', async () => {
  const output = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: '#2457d6',
    },
  }).jpeg().toBuffer();

  assert.ok(output.length > 0);
});
