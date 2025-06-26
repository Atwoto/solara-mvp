// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { BlogPost } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const slug = searchParams.get('slug'); // For fetching a single post by slug

  try {
    if (slug) {
      // Fetch a single post by slug
      const { data, error } = await supabase
        .from('articles') // Your table name
        .select('*')
        .eq('slug', slug)
        // Ensure it's published (RLS policy should also handle this, but good to be explicit)
        .lte('published_at', new Date().toISOString()) 
        .not('published_at', 'is', null)
        .single(); // Expect one row

      if (error) {
        console.error('Supabase error fetching single article by slug:', error);
        if (error.code === 'PGRST116') { // PostgREST error code for "Searched for a single row, but got 0 rows"
             return NextResponse.json({ message: 'Article not found or not published' }, { status: 404 });
        }
        throw error;
      }
      if (!data) {
        return NextResponse.json({ message: 'Article not found or not published' }, { status: 404 });
      }
      return NextResponse.json(data as BlogPost);

    } else {
      // Fetch a list of posts
      let query = supabase
        .from('articles')
        .select('*')
        // RLS policy handles published_at check, but explicitly adding it here
        // ensures we only get published posts even if RLS was misconfigured for some reason
        .lte('published_at', new Date().toISOString()) 
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false }); // Latest first

      if (limitParam) {
        const limit = parseInt(limitParam, 10);
        if (!isNaN(limit) && limit > 0) {
          query = query.limit(limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error fetching articles:', error);
        throw error;
      }
      return NextResponse.json(data as BlogPost[] || []);
    }

  } catch (error: any) {
    console.error('Error fetching articles (API):', error.message);
    return NextResponse.json({ message: 'Failed to fetch articles', error: error.message }, { status: 500 });
  }
}