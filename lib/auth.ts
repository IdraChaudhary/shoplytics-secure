import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface JWTPayload {
  tenantId: string;
  email: string;
  name: string;
  shopDomain?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Generate JWT tokens
  generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ tenantId: payload.tenantId }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Compare password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Authenticate tenant
  async authenticateTenant(email: string, password: string): Promise<{
    success: boolean;
    tenant?: any;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      // Find tenant by email
      const tenant = await this.prisma.tenant.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          shopDomain: true,
          isActive: true,
          shopifyAccessToken: true,
        }
      });

      if (!tenant) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      if (!tenant.isActive) {
        return {
          success: false,
          error: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, tenant.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate tokens
      const tokens = this.generateTokens({
        tenantId: tenant.id,
        email: tenant.email,
        name: tenant.name,
        shopDomain: tenant.shopDomain || undefined
      });

      // Update last login
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { lastLoginAt: new Date() }
      });

      return {
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          shopDomain: tenant.shopDomain,
          hasShopifyIntegration: !!tenant.shopifyAccessToken
        },
        tokens
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Register new tenant
  async registerTenant(data: {
    name: string;
    email: string;
    password: string;
    shopDomain?: string;
    shopifyAccessToken?: string;
  }): Promise<{
    success: boolean;
    tenant?: any;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      // Check if tenant already exists
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { email: data.email }
      });

      if (existingTenant) {
        return {
          success: false,
          error: 'Account with this email already exists'
        };
      }

      // Validate Shopify store if provided
      if (data.shopDomain && data.shopifyAccessToken) {
        const shopifyValid = await this.validateShopifyStore(data.shopDomain, data.shopifyAccessToken);
        if (!shopifyValid.success) {
          return {
            success: false,
            error: shopifyValid.error || 'Invalid Shopify store credentials'
          };
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Generate API key
      const apiKey = this.generateApiKey();
      const webhookSecret = this.generateWebhookSecret();

      // Create tenant
      const tenant = await this.prisma.tenant.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          shopDomain: data.shopDomain,
          shopifyAccessToken: data.shopifyAccessToken,
          apiKey,
          webhookSecret,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          shopDomain: true,
          apiKey: true
        }
      });

      // Generate auth tokens
      const tokens = this.generateTokens({
        tenantId: tenant.id,
        email: tenant.email,
        name: tenant.name,
        shopDomain: tenant.shopDomain || undefined
      });

      return {
        success: true,
        tenant: {
          ...tenant,
          hasShopifyIntegration: !!data.shopifyAccessToken
        },
        tokens
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Validate Shopify store
  private async validateShopifyStore(shopDomain: string, accessToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { createShopifyClient } = await import('../services/shopify/client');
      
      const client = createShopifyClient({
        shopDomain,
        accessToken
      });

      const isHealthy = await client.healthCheck();
      
      if (!isHealthy) {
        return {
          success: false,
          error: 'Unable to connect to Shopify store. Please check your store URL and access token.'
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Shopify validation error:', error);
      return {
        success: false,
        error: 'Failed to validate Shopify store connection'
      };
    }
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<{
    success: boolean;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      const decoded = this.verifyToken(refreshToken);
      if (!decoded || !decoded.tenantId) {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      // Get tenant info
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: decoded.tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          shopDomain: true,
          isActive: true
        }
      });

      if (!tenant || !tenant.isActive) {
        return {
          success: false,
          error: 'Tenant not found or inactive'
        };
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        tenantId: tenant.id,
        email: tenant.email,
        name: tenant.name,
        shopDomain: tenant.shopDomain || undefined
      });

      return {
        success: true,
        tokens
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh tokens'
      };
    }
  }

  // Get tenant from token
  async getTenantFromToken(token: string): Promise<any | null> {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded || !decoded.tenantId) {
        return null;
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: decoded.tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          shopDomain: true,
          isActive: true,
          apiKey: true,
          shopifyAccessToken: true
        }
      });

      if (!tenant || !tenant.isActive) {
        return null;
      }

      return {
        ...tenant,
        hasShopifyIntegration: !!tenant.shopifyAccessToken
      };

    } catch (error) {
      console.error('Get tenant from token error:', error);
      return null;
    }
  }

  // Generate API key
  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'sk_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate webhook secret
  private generateWebhookSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Regenerate API key
  async regenerateApiKey(tenantId: string): Promise<{
    success: boolean;
    apiKey?: string;
    error?: string;
  }> {
    try {
      const newApiKey = this.generateApiKey();
      
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { 
          apiKey: newApiKey,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        apiKey: newApiKey
      };

    } catch (error) {
      console.error('API key regeneration error:', error);
      return {
        success: false,
        error: 'Failed to regenerate API key'
      };
    }
  }
}

// Middleware for API routes
export function withAuth(handler: (req: NextRequest, tenant: any) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header or cookie
      let token: string | undefined;
      
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Try to get from cookie
        const cookieStore = cookies();
        token = cookieStore.get('auth-token')?.value;
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token and get tenant
      const authService = new AuthService(new PrismaClient());
      const tenant = await authService.getTenantFromToken(token);

      if (!tenant) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Call the handler with tenant context
      return handler(req, tenant);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Set auth cookies
export function setAuthCookies(response: NextResponse, tokens: AuthTokens): NextResponse {
  // Set HTTP-only cookie for access token
  response.cookies.set('auth-token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });

  // Set HTTP-only cookie for refresh token
  response.cookies.set('refresh-token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  });

  return response;
}

// Clear auth cookies
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  response.cookies.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}

// Export singleton instance
export const authService = new AuthService(new PrismaClient());
