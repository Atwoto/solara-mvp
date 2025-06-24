// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Product as AppProductType, CartItem as AppCartItemType } from '@/types';
import type { Session } from 'next-auth';

// Helper to create a user-specific Supabase client
const createSupabaseClientForUser = (session: Session) => {
  const accessToken = (session as any).supabaseAccessToken;
  if (!accessToken) throw new Error("User is not authenticated with Supabase.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { data, error } = await supabase.from('cart').select(`id, cart_items(product_id, quantity, products(*))`).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      const { error: createError } = await supabase.from('cart').insert({ user_id: session.user.id });
      if (createError) throw createError;
      return NextResponse.json([]);
    }
    const validCartItems = data.cart_items.reduce((acc: AppCartItemType[], item: any) => {
      if (item && item.products) acc.push({ ...item.products, quantity: item.quantity });
      return acc;
    }, []);
    return NextResponse.json(validCartItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId, quantity = 1 } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    let { data: cart } = await supabase.from('cart').select('id').single();
    if (!cart) {
      const { data: newCart } = await supabase.from('cart').insert({ user_id: session.user.id }).select('id').single();
      cart = newCart;
    }
    if (!cart) throw new Error("Could not get or create cart.");

    const { data: existingItem } = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', productId).single();
    if (existingItem) {
      await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id);
    } else {
      await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: productId, quantity });
    }
    return NextResponse.json({ success: true, message: "Cart updated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId } = await req.json();
    if (!productId) { // This is for removing a single item
        // Logic to clear the whole cart
        let { data: cart } = await supabase.from('cart').select('id').single();
        if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        return NextResponse.json({ success: true, message: "Cart cleared." });
    } else { // Logic for removing one item
        let { data: cart } = await supabase.from('cart').select('id').single();
        if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId);
        return NextResponse.json({ success: true, message: "Item removed." });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}