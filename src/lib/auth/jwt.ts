import jwt from 'jsonwebtoken';
import { type User } from '@/lib/database/schemas';

// JWT configuration
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function getJwtSecrets() {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!secret || !refreshSecret) {
    throw new Error('JWT secrets must be defined in environment variables');
  }

  return {
    JWT_SECRET: secret,
    JWT_REFRESH_SECRET: refreshSecret
  };
}

const { JWT_SECRET, JWT_REFRESH_SECRET } = getJwtSecrets();

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  storeId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh token pair
 */
export function generateTokens(user: User, storeId?: string): TokenPair {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    storeId: storeId || user.defaultStoreId || undefined,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'shoplytics-secure',
    audience: 'shoplytics-users',
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'shoplytics-secure',
      audience: 'shoplytics-refresh',
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shoplytics-secure',
      audience: 'shoplytics-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'shoplytics-secure',
      audience: 'shoplytics-refresh',
    }) as { userId: string };

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Refresh token verification failed');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'viewer': 1,
    'analyst': 2,
    'admin': 3,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user has specific permission for a store
 */
export function hasStorePermission(userStoreId: string | undefined, targetStoreId: string): boolean {
  return userStoreId === targetStoreId;
}

/**
 * Generate a short-lived token for email verification or password reset
 */
export function generateVerificationToken(userId: string, purpose: 'email-verification' | 'password-reset'): string {
  const payload = {
    userId,
    purpose,
    timestamp: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: purpose === 'email-verification' ? '24h' : '1h',
    issuer: 'shoplytics-secure',
    audience: `shoplytics-${purpose}`,
  });
}

/**
 * Verify verification token
 */
export function verifyVerificationToken(
  token: string, 
  purpose: 'email-verification' | 'password-reset'
): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shoplytics-secure',
      audience: `shoplytics-${purpose}`,
    }) as { userId: string; purpose: string };

    if (decoded.purpose !== purpose) {
      throw new Error('Invalid token purpose');
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Verification token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid verification token');
    }
    throw new Error('Verification token validation failed');
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeTokenUnsafe(token: string): any {
  return jwt.decode(token);
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
}
