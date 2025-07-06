// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// --- ADD THIS LINE ---
// This tells Next.js to always treat this route as dynamic,
// ensuring it fetches fresh data from the database on every request.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data || []);

  } catch (error: any) {
    console.error("Error fetching published projects:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}