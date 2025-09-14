import { NextRequest, NextResponse } from 'next/server';
import { authService, setAuthCookies } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Refresh tokens
    const result = await authService.refreshTokens(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully'
    });

    // Set new auth cookies
    if (result.tokens) {
      setAuthCookies(response, result.tokens);
    }

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
