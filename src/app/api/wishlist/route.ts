// /src/app/api/wishlist/route.ts
// --- FINAL, CORRECTED VERSION using the working pattern ---

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// We create the same simple, direct admin client here.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- GET Function: Fetches the user's wishlist IDs ---
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([]); // A logged-out user has an empty wishlist.
  }

  try {
    // We use the user's ID from NextAuth to securely fetch their wishlist.
    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', session.user.id);

    if (error) throw error;
    
    // The frontend expects a simple array of IDs, like ['id1', 'id2', ...]
    const wishlistIds = data ? data.map(item => item.product_id) : [];
    return NextResponse.json(wishlistIds);
  } catch (error: any) {
    console.error('Wishlist GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// --- POST Function: Adds an item to the wishlist ---
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // 'upsert' will safely insert the item. If it's already there, it does nothing.
    // We provide both user_id and product_id to satisfy the table's columns.
    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .upsert({ user_id: session.user.id, product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Item added to wishlist." });
  } catch (error: any) {
    console.error('Wishlist POST Error:', error.message);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

// --- DELETE Function: Removes an item from the wishlist ---
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // We use .match() to ensure a user can ONLY delete an item from their OWN wishlist.
    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .match({ user_id: session.user.id, product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Item removed from wishlist." });
  } catch (error: any) {
    console.error('Wishlist DELETE Error:', error.message);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}