// src/app/auth/callback/route.ts

// THE FIX: Import from the new, correct '@supabase/ssr' library
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    // Use createServerClient for server-side route handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: () => cookieStore }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the origin (your homepage) after sign-in
  return NextResponse.redirect(requestUrl.origin);
}