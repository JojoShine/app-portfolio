const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';
process.env.JWT_ISSUER = 'app-portfolio-test';
process.env.JWT_AUDIENCE = 'app-portfolio-api-test';

const authService = require('../src/system/auth').service;

test('development access token preserves subject and normalized roles', () => {
  const token = authService.issueDevelopmentToken({
    userId: 'local-user',
    displayName: 'Local User',
    roles: ['admin', 'admin', ''],
  });

  assert.deepEqual(authService.verifyAccessToken(token), {
    id: 'local-user',
    displayName: 'Local User',
    roles: ['admin'],
    schoolIds: [],
  });
});

test('invalid access token is rejected', () => {
  assert.throws(
    () => authService.verifyAccessToken('invalid-token'),
    { name: 'UnauthorizedError' }
  );
});
