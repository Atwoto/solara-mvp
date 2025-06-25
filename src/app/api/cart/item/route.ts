// src/app/api/cart/item/route.ts -- FINAL, CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CartItem, Product as AppProductType } from '@/types';
import type { Session } from 'next-auth';

// Helper to get user's cart ID
async function getUserCartId(userId: string): Promise<string | null> {
    if (!supabaseAdmin) return null;
    try {
        // --- FIX 1: REMOVED <{ id: string }> from .single() ---
        const { data: cart, error } = await supabaseAdmin
            .from('cart')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { 
            console.error("Error fetching user's cart ID:", error);
            return null;
        }
        // Use optional chaining `?.` which is safer than asserting
        return cart?.id || null;
    } catch (e) {
        console.error("Exception in getUserCartId:", e);
        return null;
    }
}

// Helper to get product details
async function getProductDetails(productId: string): Promise<AppProductType | null> {
    if (!supabaseAdmin) return null;
    try {
        // --- FIX 2: REMOVED <AppProductType> from .single() ---
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error("Error fetching product details:", error);
            return null;
        }
        // Use type assertion here instead
        return product as AppProductType | null;
    } catch(e) {
        console.error("Exception in getProductDetails:", e);
        return null;
    }
}

// --- PUT (Update Item Quantity) ---
export async function PUT(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId, newQuantity } = await req.json();
        if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) {
            return NextResponse.json({ error: "Invalid request: productId and a valid newQuantity are required." }, { status: 400 });
        }

        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            return NextResponse.json({ error: "User cart not found." }, { status: 404 });
        }

        if (newQuantity === 0) {
            const { error: deleteError } = await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
            if (deleteError) throw deleteError;
            return NextResponse.json({ message: "Item removed from cart due to zero quantity" });
        }

        const product = await getProductDetails(productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        // --- FIX 3: REMOVED <{...}> from .single() and used assertion ---
        const { data: updatedCartItemData, error: updateError } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .select('quantity, product_id')
            .single();

        if (updateError) {
            if (updateError.code === 'PGRST116') { 
                return NextResponse.json({ error: "Item not found in cart to update." }, { status: 404 });
            }
            throw updateError;
        }

        const updatedCartItem = updatedCartItemData as { quantity: number; product_id: string };

        const cartItem: CartItem = {
            ...product,
            quantity: updatedCartItem.quantity,
        };

        return NextResponse.json({ message: "Item quantity updated", item: cartItem });

    } catch (error: any) {
        console.error("Error in PUT /api/cart/item:", error);
        return NextResponse.json({ error: "Failed to update item quantity.", details: error.message }, { status: 500 });
    }
}

// --- DELETE (Remove Specific Item from Cart) ---
export async function DELETE(req: NextRequest) {
    // This function looks correct already, no changes needed.
    if (!supabaseAdmin) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: "Invalid request: productId is required as a query parameter." }, { status: 400 });
    }

    try {
        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            return NextResponse.json({ message: "User cart not found, nothing to delete." });
        }

        const { error: deleteError } = await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
        if (deleteError) {
            console.error("Error deleting item from cart_items:", deleteError);
            throw deleteError;
        }

        return NextResponse.json({ message: "Item removed from cart successfully" });

    } catch (error: any) {
        console.error("Error in DELETE /api/cart/item:", error);
        return NextResponse.json({ error: "Failed to remove item from cart.", details: error.message }, { status: 500 });
    }
}