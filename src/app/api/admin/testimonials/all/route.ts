// src/app/api/admin/testimonials/all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { Testimonial } from '@/types';

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data as unknown as Testimonial[] || []);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch testimonials', error: error.message }, { status: 500 });
  }
}