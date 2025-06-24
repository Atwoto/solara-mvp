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
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
};

// --- GET User's Cart ---
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createSupabaseClientForUser(session);
        
        // This query now relies on RLS (Row Level Security) being enabled in your Supabase dashboard
        // to ensure users can only access their own cart.
        const { data, error } = await supabase
            .from('cart')
            .select(`id, cart_items (product_id, quantity, products (*))`)
            .single();

        if (error && error.code !== 'PGRST116') { // 'PGRST116' means no cart found, which is okay.
            throw error;
        }
        
        // If no cart exists, create one.
        if (!data) {
            const { data: newCart, error: createError } = await supabase.from('cart').insert({ user_id: session.user.id }).select().single();
            if (createError) throw createError;
            return NextResponse.json([]); // Return empty cart for the new user.
        }

        const cartItems = data.cart_items
            .filter(item => item.products) // Filter out items where product might be null
            .map(item => ({...(item.products as AppProductType), quantity: item.quantity}));
            
        return NextResponse.json(cartItems);

    } catch (error: any) {
        console.error("GET /api/cart Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch cart.", details: error.message }, { status: 500 });
    }
}


// --- POST (Add Item to Cart / Update Quantity) ---
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createSupabaseClientForUser(session);
        const { productId, quantity = 1 } = await req.json();

        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            return NextResponse.json({ error: "Invalid product ID or quantity provided." }, { status: 400 });
        }

        // Get or create cart
        let { data: cartData, error: cartError } = await supabase.from('cart').select('id').single();
        if (cartError && cartError.code !== 'PGRST116') throw cartError;
        
        let cartId: string;
        if (cartData) {
            cartId = cartData.id;
        } else {
            const { data: newCart, error: createError } = await supabase.from('cart').insert({ user_id: session.user.id }).select('id').single();
            if (createError) throw createError;
            cartId = newCart!.id;
        }
        
        // Check for existing item
        const { data: existingItem } = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('product_id', productId).single();

        let upsertedItem;
        if (existingItem) {
            // Update quantity
            const { data, error } = await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id).select('*, products(*)').single();
            if (error) throw error;
            upsertedItem = data;
        } else {
            // Insert new item
            const { data, error } = await supabase.from('cart_items').insert({ cart_id: cartId, product_id: productId, quantity }).select('*, products(*)').single();
            if (error) throw error;
            upsertedItem = data;
        }

        if (!upsertedItem || !upsertedItem.products) {
            throw new Error("Failed to process cart item.");
        }

        const finalItem: AppCartItemType = {
            ...(upsertedItem.products as AppProductType),
            quantity: upsertedItem.quantity
        };

        return NextResponse.json({ message: "Item processed successfully", item: finalItem });

    } catch (error: any) {
        console.error("POST /api/cart Error:", error.message);
        return NextResponse.json({ error: "Failed to process cart item.", details: error.message }, { status: 500 });
    }
}

// --- DELETE (Clear Cart) ---
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const supabase = createSupabaseClientForUser(session);
        const { data: cart, error: cartError } = await supabase.from('cart').select('id').single();

        if (cartError && cartError.code !== 'PGRST116') throw cartError;

        if (cart) {
            const { error: deleteError } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
            if (deleteError) throw deleteError;
        }
        
        return NextResponse.json({ message: "Cart cleared successfully" });
    } catch (error: any) {
        console.error("DELETE /api/cart Error:", error.message);
        return NextResponse.json({ error: "Failed to clear cart.", details: error.message }, { status: 500 });
    }
}