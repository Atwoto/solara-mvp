// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // It's better to use the admin client for consistency
import { Product as ProductType } from '@/types'; 

// Use the secure admin client, which is best practice for all API routes.
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // --- NEW LOGIC TO HANDLE FETCHING BY MULTIPLE IDs ---
  // This is for the wishlist page.
  const ids = searchParams.get('ids');
  if (ids) {
    try {
      const idArray = ids.split(',');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', idArray); // .in() is the Supabase function for 'WHERE id IN (...)

      if (error) {
        console.error('Supabase error fetching products by IDs:', error);
        throw error;
      }
      return NextResponse.json(data as ProductType[] || []);

    } catch (error: any) {
      console.error('Error fetching products by IDs:', error.message);
      return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
    }
  }

  // --- YOUR EXISTING LOGIC FOR FETCHING BY CATEGORY ---
  // This is for the main product catalog pages.
  const categorySlug = searchParams.get('category');

  try {
    let query = supabase
      .from('products')
      .select('*');

    if (categorySlug) {
      // Filter by category if the slug is provided
      query = query.eq('category', categorySlug); 
    }

    // You can add default sorting
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching products by category:', error);
      throw error; 
    }

    return NextResponse.json(data as ProductType[] || []);

  } catch (error: any) {
    console.error('Error fetching products by category:', error.message);
    return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
  }
}