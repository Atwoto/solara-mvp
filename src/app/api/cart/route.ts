// /src/app/api/cart/route.ts -- FINAL VERSION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { CartItem as AppCartItemType } from '@/types';

// Create ONE single, secure, server-side Supabase client with admin rights
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cart - Fetches the user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { data, error } = await supabase
        .from('cart')
        .select(`id, cart_items(product_id, quantity, products(*))`)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no cart found"
    
    if (!data || !data.cart_items) {
      return NextResponse.json([]); // No cart or empty cart
    }

    const validCartItems = data.cart_items.reduce((acc: AppCartItemType[], item: any) => {
      if (item && item.products) {
        acc.push({ ...item.products, quantity: item.quantity });
      }
      return acc;
    }, []);

    return NextResponse.json(validCartItems);
  } catch (error: any) {
    console.error('Cart GET Error:', error.message);
    return NextResponse.json({ error: "Failed to fetch cart." }, { status: 500 });
  }
}

// POST /api/cart - Adds an item to the user's cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { productId, quantity = 1 } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    let { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('cart').insert({ user_id: userId }).select('id').single();
      
      if (createError || !newCart) {
        console.error("Supabase create cart error:", createError);
        throw new Error("Could not create cart.");
      }
      cart = newCart;
    }

    const { data: existingItem } = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', productId).single();

    if (existingItem) {
      await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity });
    }
    
    return NextResponse.json({ success: true, message: "Cart updated." });
  } catch (error: any) {
    console.error('Cart POST Error:', error.message);
    return NextResponse.json({ error: "Failed to update cart." }, { status: 500 });
  }
}

// DELETE /api/cart - Removes an item or clears the cart
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { productId } = await req.json();
        let { data: cart } = await supabase.from('cart').select('id').eq('user_id', userId).single();

        if (!cart) {
             return NextResponse.json({ success: true, message: "Cart is already empty." });
        }

        if (!productId) { // If no productId is provided, clear the entire cart
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);
            return NextResponse.json({ success: true, message: "Cart cleared." });
        } else { // Otherwise, remove a single item
            await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId);
            return NextResponse.json({ success: true, message: "Item removed." });
        }
    } catch (error: any) {
        console.error('Cart DELETE Error:', error.message);
        return NextResponse.json({ error: "Failed to update cart." }, { status: 500 });
    }
}