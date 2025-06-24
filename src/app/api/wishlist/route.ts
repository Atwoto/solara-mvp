// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

// Helper to create a user-specific Supabase client
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
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const supabase = createSupabaseClientForUser(session);
    // This assumes RLS is enabled on 'wishlist_items'
    const { data, error } = await supabase.from('wishlist_items').select('product_id');

    if (error) throw error;
    
    // The context expects an array of product IDs, not objects.
    const wishlistIds = data.map(item => item.product_id);
    return NextResponse.json(wishlistIds || []); 

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST and DELETE logic can be re-added here, using the `createSupabaseClientForUser` method.

// POST: Add an item to the wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Use .upsert() to prevent duplicates.
    // For this to work, you MUST have a UNIQUE constraint on (user_id, product_id) in your Supabase table.
    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .upsert({ user_id: session.user.id, product_id: productId }, { onConflict: 'user_id, product_id' }); // Specify conflict target

    if (error) {
      console.error("API WISHLIST POST: Supabase error", error);
      throw error;
    }

    return NextResponse.json({ success: true, message: "Item added to wishlist." });

  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE: Remove an item from the wishlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
  
    const { productId } = await req.json();
  
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
  
    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .match({ user_id: session.user.id, product_id: productId });
  
    if (error) {
      console.error("API WISHLIST DELETE: Supabase error", error);
      throw error;
    }
  
    return NextResponse.json({ success: true, message: "Item removed from wishlist." });

  } catch (error: any) {
    console.error("Error deleting from wishlist:", error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}