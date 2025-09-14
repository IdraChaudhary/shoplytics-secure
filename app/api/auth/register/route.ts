import { NextRequest, NextResponse } from 'next/server';
import { authService, setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

// Registration request schema
const registerSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  shopDomain: z.string().optional(),
  shopifyAccessToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, password, shopDomain, shopifyAccessToken } = validation.data;

    // Register tenant
    const result = await authService.registerTenant({
      name,
      email,
      password,
      shopDomain,
      shopifyAccessToken
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Create response with tenant data
    const response = NextResponse.json({
      success: true,
      tenant: result.tenant,
      message: 'Registration successful'
    });

    // Set auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens);
    }

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
