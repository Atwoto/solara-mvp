// src/app/api/wishlist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

// Helper to create a user-specific Supabase client, authenticated as the logged-in user.
const createSupabaseClientForUser = (session: Session) => {
  const accessToken = (session as any).supabaseAccessToken;
  if (!accessToken) throw new Error("User is not authenticated with Supabase.");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
};

// GET: Fetch the user's wishlist
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseClientForUser(session);
    // This query now relies on RLS to only fetch the current user's items.
    const { data, error } = await supabase.from('wishlist_items').select('product_id');

    if (error) throw error;
    
    // The client-side context expects an array of strings (product IDs).
    const wishlistIds = data.map(item => item.product_id);
    return NextResponse.json(wishlistIds || []); 

  } catch (error: any) {
    console.error("Error fetching wishlist:", error.message);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST: Add an item to the wishlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // The user_id is now implicitly handled by the authenticated client and RLS policies.
    const { error } = await supabase.from('wishlist_items').upsert({ product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Item added to wishlist." });

  } catch (error: any) {
    console.error("Error adding to wishlist:", error.message);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE: Remove an item from the wishlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId } = await req.json();
  
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
  
    // RLS ensures the user can only delete their own wishlist items.
    const { error } = await supabase.from('wishlist_items').delete().eq('product_id', productId);
  
    if (error) throw error;
  
    return NextResponse.json({ success: true, message: "Item removed from wishlist." });

  } catch (error: any) {
    console.error("Error deleting from wishlist:", error.message);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}