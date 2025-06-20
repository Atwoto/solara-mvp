// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Product as ProductType } from '@/types'; // Using the defined Product type

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category'); // e.g., 'solar-panels', 'hybrid-inverters'

  // console.log(`API received categorySlug: ${categorySlug}`); // For debugging

  try {
    let query = supabase
      .from('products') // Your table name
      .select('*');

    if (categorySlug) {
      // This assumes your 'products.category' column stores values like 'solar-panels', 'hybrid-inverters', etc.
      // directly matching the slugs from your Header.tsx links and PRODUCT_CATEGORY_SLUGS.
      query = query.eq('category', categorySlug); 
    }
    
    // Example: If you decided to use separate 'type' or 'technology' columns in DB
    // const type = searchParams.get('type');
    // if (type) {
    //   query = query.eq('type', type); // Assumes a 'type' column
    // }
    // const technology = searchParams.get('technology');
    // if (technology) {
    //   query = query.eq('technology', technology); // Assumes a 'technology' column
    // }

    query = query.order('name', { ascending: true }); // Or by price, created_at, etc.

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching products:', error);
      throw error; 
    }

    return NextResponse.json(data as ProductType[] || []);

  } catch (error: any) {
    console.error('Error fetching products:', error.message);
    return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
  }
}