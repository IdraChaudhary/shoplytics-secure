import { NextRequest, NextResponse } from 'next/server';
import { authService, setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Authenticate tenant
    const result = await authService.authenticateTenant(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create response with tenant data
    const response = NextResponse.json({
      success: true,
      tenant: result.tenant,
      message: 'Login successful'
    });

    // Set auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens);
    }

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
