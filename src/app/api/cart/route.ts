// /src/app/api/cart/route.ts
// --- FINAL, COMPLETE, ROBUST, AND CORRECTED VERSION ---

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import type { Product as AppProductType } from '@/types';

// Create the admin client right here. This is simple and robust.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to find or create a user's cart. This prevents code duplication.
async function findOrCreateCart(userId: string) {
  // 1. Try to find the user's existing cart.
  const { data: existingCart } = await supabaseAdmin.from('cart').select('id').eq('user_id', userId).single();
  if (existingCart) {
    return existingCart;
  }

  // 2. If no cart exists, create a new one.
  const { data: newCart, error: createError } = await supabaseAdmin
    .from('cart').insert({ user_id: userId }).select('id').single();
  
  if (createError) {
    console.error("FATAL: Supabase cart creation failed.", createError);
    throw new Error("Could not create a user cart in the database.");
  }
  return newCart;
}


// --- GET Function: Fetches the user's current cart ---
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([]); // Not logged in, empty cart
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('cart')
      .select('id, cart_items(product_id, quantity, products(*))')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data || !data.cart_items) return NextResponse.json([]);
    
    const validCartItems = data.cart_items
      .map((item: any) => (item.products ? { ...item.products, quantity: item.quantity } : null))
      .filter(Boolean);

    return NextResponse.json(validCartItems);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}


// --- POST Function: Adds an item to the cart ---
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in.' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { productId, quantity = 1 } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });

    const cart = await findOrCreateCart(userId);
    if (!cart?.id) throw new Error("A critical error occurred with the user's cart.");

    const { data: existingItem } = await supabaseAdmin.from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', productId).single();

    if (existingItem) {
      await supabaseAdmin.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id);
    } else {
      await supabaseAdmin.from('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity });
    }
    
    return NextResponse.json({ success: true, message: "Item added to cart." });
  } catch (error: any) {
    console.error('CRITICAL CART POST ERROR:', error.message);
    return NextResponse.json({ error: 'A server error occurred while adding the item to the cart.' }, { status: 500 });
  }
}


// --- PUT Function: Updates an item's specific quantity ---
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { productId, newQuantity } = await req.json();
    if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) {
      return NextResponse.json({ error: "Valid Product ID and quantity are required" }, { status: 400 });
    }
    
    const cart = await findOrCreateCart(session.user.id);
    if (!cart?.id) throw new Error("A critical error occurred with the user's cart.");
    
    if (newQuantity === 0) {
      await supabaseAdmin.from('cart_items').delete().match({ cart_id: cart.id, product_id: productId });
    } else {
      await supabaseAdmin.from('cart_items').update({ quantity: newQuantity }).match({ cart_id: cart.id, product_id: productId });
    }
    
    return NextResponse.json({ success: true, message: "Item quantity updated." });
  } catch (error: any) {
    console.error('CRITICAL CART PUT ERROR:', error.message);
    return NextResponse.json({ error: 'A server error occurred while updating the cart.' }, { status: 500 });
  }
}


// --- DELETE Function: Removes an item or clears the entire cart ---
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const payload = await req.json().catch(() => ({}));
        const { productId } = payload;
        
        const cart = await findOrCreateCart(session.user.id);
        if (!cart?.id) return NextResponse.json({ success: true }); // No cart to delete from

        if (productId) {
            await supabaseAdmin.from('cart_items').delete().match({ cart_id: cart.id, product_id: productId });
            return NextResponse.json({ success: true, message: "Item removed from cart." });
        } else {
            await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);
            return NextResponse.json({ success: true, message: "Cart has been cleared." });
        }
    } catch (error: any) {
        console.error('CRITICAL CART DELETE ERROR:', error.message);
        return NextResponse.json({ error: 'A server error occurred while clearing the cart.' }, { status: 500 });
    }
}