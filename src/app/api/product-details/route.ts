// src/app/api/product-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';// Use the public (anon key) client
import { Product as ProductType } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      console.error('API Product Details: Supabase error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ message: 'Database error fetching product', error: error.message }, { status: 500 });
    }
    
    if (!data) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data as ProductType);

  } catch (error: any) {
    console.error('API Product Details: Unhandled error:', error.message, error.stack);
    return NextResponse.json({ message: 'Unexpected server error', error: error.message }, { status: 500 });
  }
}