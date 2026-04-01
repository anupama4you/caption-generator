import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ?? '';
  if (!key) {
    // In dev without key, use a deterministic fallback (not secure — set the env var)
    return crypto.scryptSync('dev-fallback-key', 'salt', 32);
  }
  return Buffer.from(key.slice(0, 64), 'hex');
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, encryptedHex] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

// Generate a cryptographically secure PKCE verifier + challenge (for Twitter)
export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// Generate random state param
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}
