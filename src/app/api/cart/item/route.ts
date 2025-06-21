// src/app/api/cart/item/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CartItem, Product as AppProductType } from '@/types';
import type { Session } from 'next-auth'; // Import for explicit session typing

// Helper to get user's cart ID
async function getUserCartId(userId: string): Promise<string | null> {
    if (!supabaseAdmin) return null;
    try {
        const { data: cart, error } = await supabaseAdmin
            .from('cart')
            .select('id')
            .eq('user_id', userId)
            .single<{ id: string }>(); // Type hint for Supabase response

        if (error && error.code !== 'PGRST116') { 
            console.error("Error fetching user's cart ID:", error);
            return null;
        }
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
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .select('*') // Select all columns to match AppProductType
            .eq('id', productId)
            .single<AppProductType>(); // Type hint for Supabase response
        
        if (error) {
            console.error("Error fetching product details:", error);
            return null;
        }
        return product;
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

        if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) { // Allow quantity of 0 to trigger deletion
            return NextResponse.json({ error: "Invalid request: productId and a valid newQuantity are required." }, { status: 400 });
        }

        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            return NextResponse.json({ error: "User cart not found." }, { status: 404 });
        }

        // If new quantity is 0, delete the item instead of updating
        if (newQuantity === 0) {
            const { error: deleteError } = await supabaseAdmin
                .from('cart_items')
                .delete()
                .eq('cart_id', cartId)
                .eq('product_id', productId);
            
            if (deleteError) throw deleteError;
            return NextResponse.json({ message: "Item removed from cart due to zero quantity" });
        }

        // First, get the product details to ensure it exists
        const product = await getProductDetails(productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        // Update the cart item quantity
        const { data: updatedCartItem, error: updateError } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .select('quantity, product_id')
            .single<{ quantity: number; product_id: string }>(); // <<--- FIX: Add type hint here

        if (updateError) {
            if (updateError.code === 'PGRST116') { 
                return NextResponse.json({ error: "Item not found in cart to update." }, { status: 404 });
            }
            throw updateError;
        }

        // Combine the product details with the updated quantity
        const cartItem: CartItem = {
            ...product,
            quantity: updatedCartItem.quantity, // Now TypeScript knows this is a number
        };

        return NextResponse.json({ message: "Item quantity updated", item: cartItem });

    } catch (error: any) {
        console.error("Error in PUT /api/cart/item:", error);
        return NextResponse.json({ error: "Failed to update item quantity.", details: error.message }, { status: 500 });
    }
}

// --- DELETE (Remove Specific Item from Cart) ---
export async function DELETE(req: NextRequest) {
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
            // If there's no cart, the item doesn't exist, so the action is technically successful.
            return NextResponse.json({ message: "User cart not found, nothing to delete." });
        }

        // Delete the item. No need to check for existence first, delete will just affect 0 rows if it's not there.
        const { error: deleteError } = await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId)
            .eq('product_id', productId);

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