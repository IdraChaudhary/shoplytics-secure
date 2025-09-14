import { NextRequest, NextResponse } from 'next/server';
import { withAuth, authService } from '@/lib/auth';

export const POST = withAuth(async (req: NextRequest, tenant: any) => {
  try {
    // Regenerate API key
    const result = await authService.regenerateApiKey(tenant.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey: result.apiKey
    });

  } catch (error) {
    console.error('API key regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
      { status: 500 }
    );
  }
});
