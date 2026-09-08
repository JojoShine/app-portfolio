'use strict';

const crypto = require('crypto');
const env = require('../../../config/env');

const secret = () => env.ENROLLMENT_DATA_KEY || env.JWT_SECRET || 'development-only-captcha-key';
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
const codeDigest = (salt, code) => crypto
  .createHmac('sha256', secret())
  .update(`captcha:${salt}:${String(code).trim().toLowerCase()}`)
  .digest('base64url');

const createCaptcha = () => {
  const code = String(crypto.randomInt(1000, 10000));
  const salt = crypto.randomBytes(16).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    salt,
    expiresAt: Date.now() + 5 * 60 * 1000,
    codeDigest: codeDigest(salt, code),
  })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  const noise = Array.from({ length: 4 }, (_, index) => (
    `<line x1="${8 + index * 24}" y1="${crypto.randomInt(4, 30)}" x2="${28 + index * 24}" y2="${crypto.randomInt(10, 36)}" stroke="#a7b7d8" stroke-width="1"/>`
  )).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#eef3ff"/>${noise}<text x="60" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="7" fill="#244da8">${code}</text></svg>`;
  return {
    token,
    image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    expiresIn: 300,
  };
};

const verifyCaptcha = (token, code) => {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return false;
    const expected = sign(payload);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.expiresAt < Date.now() || !data.salt || !data.codeDigest) return false;
    const actual = Buffer.from(codeDigest(data.salt, code));
    const expectedCode = Buffer.from(data.codeDigest);
    return actual.length === expectedCode.length && crypto.timingSafeEqual(actual, expectedCode);
  } catch {
    return false;
  }
};

module.exports = { createCaptcha, verifyCaptcha };
