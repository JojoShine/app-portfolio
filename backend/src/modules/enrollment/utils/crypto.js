'use strict';

const crypto = require('crypto');
const env = require('../../../config/env');

const getEncryptionKey = () => crypto
  .createHash('sha256')
  .update(env.ENROLLMENT_DATA_KEY || env.JWT_SECRET || 'development-only-enrollment-key')
  .digest();

const normalize = (value) => String(value || '').trim();

const encrypt = (value) => {
  if (value === undefined || value === null) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
};

const decrypt = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    const [version, iv, tag, ciphertext] = value.split('.');
    if (version !== 'v1' || !iv || !tag || !ciphertext) return fallback;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getEncryptionKey(),
      Buffer.from(iv, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString('utf8'));
  } catch {
    return fallback;
  }
};

const digest = (value) => crypto
  .createHmac('sha256', getEncryptionKey())
  .update(normalize(value))
  .digest('hex');

const maskName = (name) => {
  const text = normalize(name);
  if (text.length <= 1) return '*';
  if (text.length === 2) return `${text[0]}*`;
  return `${text[0]}${'*'.repeat(Math.min(3, text.length - 2))}${text.at(-1)}`;
};

const maskIdNumber = (idNumber) => {
  const text = normalize(idNumber);
  return text.length <= 4 ? `****${text}` : `${'*'.repeat(Math.min(14, text.length - 4))}${text.slice(-4)}`;
};

module.exports = { encrypt, decrypt, digest, maskName, maskIdNumber };
