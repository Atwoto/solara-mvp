// src/app/api/admin/blog/single/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { BlogPost } from '@/types';

export async function GET(req: NextRequest) {
  // Optional: Add admin authentication check here too
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        return NextResponse.json({ message: 'Article not found' }, { status: 404 });
      }
      console.error('Supabase error fetching single article for admin:', error);
      throw error;
    }

    if (!data) {
        return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(data as unknown as BlogPost);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch article', error: error.message }, { status: 500 });
  }
}