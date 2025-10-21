import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/google-auth?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/google-auth?error=No authorization code received', request.url)
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${request.nextUrl.origin}/api/auth/google/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/admin/google-auth?error=No refresh token received. Try revoking access and authorizing again.', request.url)
      );
    }

    // Redirect back to auth page with refresh token
    return NextResponse.redirect(
      new URL(`/admin/google-auth?refresh_token=${tokens.refresh_token}`, request.url)
    );

  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/admin/google-auth?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
