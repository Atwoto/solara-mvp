// src/app/api/admin/blog/all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server'; // Use admin client
import { BlogPost } from '@/types'; // Your BlogPost type
// import { getToken } from 'next-auth/jwt'; 

// const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET(req: NextRequest) {
  // Optional: Backend authorization check for admin
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // if (!token || token.email !== ADMIN_EMAIL) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized in /api/admin/blog/all.");
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('articles') // Your table name
      .select('*') // Select all columns
      .order('created_at', { ascending: false }); // Show newest created first for admin

    if (error) {
      console.error('Supabase error fetching all articles for admin:', error);
      throw error; // Let the catch block handle it
    }

    // Apply the double assertion here
    const articles = data as unknown as BlogPost[] || []; // <--- MODIFIED LINE

    return NextResponse.json(articles); // Return the typed array or an empty array

  } catch (error: any) {
    console.error('Error fetching all articles for admin (API):', error.message);
    return NextResponse.json({ message: 'Failed to fetch articles', error: error.message }, { status: 500 });
  }
}