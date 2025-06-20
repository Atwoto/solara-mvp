// src/app/api/wishlist/route.ts

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabaseClient'; // Import the admin client for consistency and permissions

// NOTE: You don't need to create a new client here if you import supabaseAdmin from your lib

// GET: Fetch the user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("API WISHLIST GET: Not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (!supabaseAdmin) {
        console.error("API WISHLIST GET: Supabase admin client not initialized.");
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select('product_id') // Select just the needed column
      .eq('user_id', session.user.id);

    if (error) {
      console.error("API WISHLIST GET: Supabase error", error);
      throw error;
    }

    // --- START OF FIX ---
    // Return the array of objects directly.
    // The data from Supabase will be: [ { product_id: '...' }, { product_id: '...' } ]
    // This matches the `WishlistApiResponseItem[]` type that your context expects.
    return NextResponse.json(data || []); 
    // --- END OF FIX ---

  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

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