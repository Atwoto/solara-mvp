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
        
        const { data, error } = await supabase
            .from('cart')
            .select(`id, cart_items (product_id, quantity, products (*))`)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (!data || !data.cart_items) {
            const { error: createError } = await supabase.from('cart').insert({ user_id: session.user.id });
            if (createError) throw createError;
            return NextResponse.json([]); 
        }

        // --- THE DEFINITIVE, VERIFIED FIX IS HERE ---
        // This logic is different. It creates a new, clean array.
        const validCartItems: AppCartItemType[] = data.cart_items
            .filter(item => item && item.products) // Ensure item and its nested product exist
            .map(item => ({
                ...(item.products as AppProductType), // This is now safe
                quantity: item.quantity,
            }));
            
        return NextResponse.json(validCartItems);

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
        
        const { data: existingItem } = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('product_id', productId).single();

        let upsertedItem;
        if (existingItem) {
            const { data, error } = await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id).select('*, products(*)').single();
            if (error) throw error;
            upsertedItem = data;
        } else {
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