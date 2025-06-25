// /src/app/api/wishlist/route.ts -- FINAL, WORKING VERSION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Make sure this path is correct

// Create ONE single, secure, server-side Supabase client with admin rights
// This is the same pattern as your working cart API.
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/wishlist - Fetches the user's wishlist
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // A logged-out user has an empty wishlist. This is not an error.
    return NextResponse.json([]);
  }
  const userId = session.user.id;

  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;
    
    // The frontend expects an array of product IDs, e.g., [1, 5, 12]
    const wishlistIds = data ? data.map(item => item.product_id) : [];
    return NextResponse.json(wishlistIds);

  } catch (error: any) {
    console.error('Wishlist GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST /api/wishlist - Adds an item to the user's wishlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    
    // 'upsert' safely inserts the item and ignores duplicates.
    const { error } = await supabase
      .from('wishlist_items')
      .upsert({ user_id: userId, product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Item added to wishlist." });
  } catch (error: any) {
    console.error('Wishlist POST Error:', error.message);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlist - Removes an item from the user's wishlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .match({ user_id: userId, product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Item removed from wishlist." });
  } catch (error: any) {
    console.error('Wishlist DELETE Error:', error.message);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}