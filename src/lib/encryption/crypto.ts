import * as crypto from 'crypto';
import CryptoJS from 'crypto-js';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Master key derivation from environment variable
function getMasterKey(): Buffer {
  const masterSecret = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterSecret) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
  }
  
  // Use PBKDF2 to derive a consistent key from the master secret
  const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'shoplytics-secure-salt', 'utf8');
  return crypto.pbkdf2Sync(masterSecret, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Generate a new encryption key for a store
 * This key will be encrypted with the master key before storage
 */
export function generateStoreKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt a store key with the master key for safe database storage
 */
export function encryptStoreKey(storeKey: string): string {
  const masterKey = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipher('aes-256-cbc', masterKey);
  let encrypted = cipher.update(storeKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a store key from database storage
 */
export function decryptStoreKey(encryptedStoreKey: string): string {
  const masterKey = getMasterKey();
  const [ivHex, encryptedData] = encryptedStoreKey.split(':');
  
  if (!ivHex || !encryptedData) {
    throw new Error('Invalid encrypted store key format');
  }
  
  const decipher = crypto.createDecipher('aes-256-cbc', masterKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encryptData(data: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher(ALGORITHM, keyBuffer);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Format: iv:tag:encrypted_data
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decryptData(encryptedData: string, key: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, tagHex, encrypted] = parts;
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, keyBuffer);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash passwords using bcrypt-compatible method
 */
export function hashPassword(password: string): string {
  // Using CryptoJS for consistent hashing
  const salt = CryptoJS.lib.WordArray.random(128/8).toString();
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
  
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, originalHash] = hash.split(':');
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return testHash === originalHash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Generate a secure random token for password resets, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a hash of data for integrity checking
 */
export function createDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Utility to mask sensitive data for logging (preserves first and last chars)
 */
export function maskSensitiveData(data: string, visibleChars: number = 2): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - (visibleChars * 2));
  
  return `${start}${masked}${end}`;
}
