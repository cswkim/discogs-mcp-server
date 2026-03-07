import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'crypto';
import type { OAuthTokenCache, EncryptedOAuthCache } from './types.js';
import { OAUTH_CONSUMER_SECRET, OAUTH_CACHE_FILE_PATH } from './oauth-constants.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives an encryption key from the consumer secret using scrypt
 */
function deriveKey(salt: Buffer): Buffer {
  return scryptSync(OAUTH_CONSUMER_SECRET, salt, KEY_LENGTH);
}

/**
 * Encrypts token data using AES-256-GCM
 */
function encrypt(data: string): EncryptedOAuthCache {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

/**
 * Decrypts token data using AES-256-GCM
 */
function decrypt(cache: EncryptedOAuthCache): string {
  const salt = Buffer.from(cache.salt, 'hex');
  const key = deriveKey(salt);
  const iv = Buffer.from(cache.iv, 'hex');
  const authTag = Buffer.from(cache.authTag, 'hex');
  const encryptedData = Buffer.from(cache.encryptedData, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString('utf8');
}

/**
 * Reads cached OAuth tokens from disk
 * Returns null if cache doesn't exist, is invalid, or decryption fails
 */
export function readCachedTokens(): OAuthTokenCache | null {
  if (!existsSync(OAUTH_CACHE_FILE_PATH)) {
    return null;
  }

  try {
    const fileContent = readFileSync(OAUTH_CACHE_FILE_PATH, 'utf8');
    const cache: EncryptedOAuthCache = JSON.parse(fileContent);

    // Validate cache structure
    if (cache.version !== 1 || !cache.iv || !cache.salt || !cache.authTag || !cache.encryptedData) {
      return null;
    }

    const decrypted = decrypt(cache);
    const tokens: OAuthTokenCache = JSON.parse(decrypted);

    // Validate token structure
    if (!tokens.accessToken || !tokens.accessTokenSecret || !tokens.username) {
      return null;
    }

    return tokens;
  } catch {
    // Cache is corrupted or tampered with - silently return null
    // The caller will initiate a new OAuth flow
    return null;
  }
}

/**
 * Writes OAuth tokens to the encrypted cache file
 */
export function writeCachedTokens(tokens: OAuthTokenCache): void {
  const data = JSON.stringify(tokens);
  const encrypted = encrypt(data);
  writeFileSync(OAUTH_CACHE_FILE_PATH, JSON.stringify(encrypted, null, 2), 'utf8');
}

/**
 * Deletes the cached OAuth tokens
 * Called when tokens are revoked or invalid
 */
export function deleteCachedTokens(): void {
  if (existsSync(OAUTH_CACHE_FILE_PATH)) {
    unlinkSync(OAUTH_CACHE_FILE_PATH);
  }
}
