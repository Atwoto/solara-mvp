import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; // Use the secure admin client
import { Product as ProductType } from '@/types'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const supabase = supabaseAdmin; // Use the imported admin client

  // --- Logic for fetching specific products by ID (for wishlist, etc.) ---
  if (ids) {
    try {
      const idArray = ids.split(',');
      let query = supabase
        .from('products')
        .select('*')
        .in('id', idArray)
        .eq('is_archived', false); // <-- Filter out archived products here as well

      const { data, error } = await query;

      if (error) throw error;
      
      return NextResponse.json(data as ProductType[] || []);

    } catch (error: any) {
      console.error('Error fetching products by IDs:', error.message);
      return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
    }
  }

  // --- Logic for fetching products for the main catalog/category pages ---
  const categorySlug = searchParams.get('category');

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_archived', false); // <-- THE CRUCIAL FILTER to hide archived products

    if (categorySlug) {
      // Add category filter if provided
      query = query.eq('category', categorySlug); 
    }

    // Default sorting
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) throw error; 

    return NextResponse.json(data as ProductType[] || []);

  } catch (error: any) {
    console.error('Error fetching catalog products:', error.message);
    return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
  }
}