// src/app/api/admin/county-resources/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; // Use the admin client for elevated privileges

// This is the admin's email, ensuring only they can use this endpoint.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // First, check if the logged-in user is the admin.
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resourceData = await req.json();

    // Validate incoming data
    if (!resourceData.county_name || !resourceData.file_title || !resourceData.file_url) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Use the admin client to perform the database operation.
    // This has the necessary permissions to bypass RLS for trusted server-side operations.
    const { data, error } = await supabaseAdmin
      .from('county_resources')
      .upsert(resourceData) // upsert will create or update
      .select()
      .single();

    if (error) {
      console.error("Database Error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
