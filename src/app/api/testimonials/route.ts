// src/app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Use public anon client
import { Testimonial } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const featuredOnly = searchParams.get('featured') === 'true';

  try {
    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true) // RLS also handles this, but good for explicit query
      .order('created_at', { ascending: false }); // Show newest first, or by a custom order field

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching testimonials:', error);
      throw error;
    }

    return NextResponse.json(data as Testimonial[] || []);
  } catch (error: any) {
    console.error('Error fetching testimonials (API):', error.message);
    return NextResponse.json({ message: 'Failed to fetch testimonials', error: error.message }, { status: 500 });
  }
}