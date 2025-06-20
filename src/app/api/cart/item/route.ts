// src/app/api/cart/item/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CartItem, Product as AppProductType } from '@/types';

// Helper to get user's cart ID
async function getUserCartId(userId: string): Promise<string | null> {
    if (!supabaseAdmin) return null;
    const { data: cart, error } = await supabaseAdmin
        .from('cart')
        .select('id')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is fine if we create it later
        console.error("Error fetching user's cart ID:", error);
        return null; // Or throw error
    }
    // FIX: Use a strict type check instead of a truthiness check.
    // This ensures we only return a string, preventing an empty object {} from being returned.
    return typeof cart?.id === 'string' ? cart.id : null;
}


// --- PUT (Update Item Quantity) ---
export async function PUT(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId, newQuantity } = await req.json();

        if (!productId || typeof newQuantity !== 'number' || newQuantity <= 0) {
            // If quantity is 0 or less, it should be a DELETE operation ideally
            // Or the client should call the DELETE endpoint for this item
            return NextResponse.json({ error: "Invalid request: productId and a positive newQuantity are required." }, { status: 400 });
        }

        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            return NextResponse.json({ error: "User cart not found. Add an item first." }, { status: 404 });
        }

        const { data: updatedItem, error } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .select(`
                quantity, 
                product_id, 
                products (id, name, price, imageUrl, wattage, category, description, created_at)
            `) // Select updated item details with product info
            .single();

        if (error) {
            console.error("Error updating cart item quantity:", error);
            if (error.code === 'PGRST116') { // Item not found in cart to update
                return NextResponse.json({ error: "Item not found in cart to update." }, { status: 404 });
            }
            throw error;
        }
        if (!updatedItem || !updatedItem.products) {
             throw new Error("Failed to update cart item or retrieve product details after update.");
        }
        
        const cartItem: CartItem = {
            ...(updatedItem.products as AppProductType),
            quantity: updatedItem.quantity,
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

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Product ID to remove should be passed as a query parameter
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: "Invalid request: productId is required as a query parameter." }, { status: 400 });
    }

    try {
        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            // No cart means nothing to delete from, consider this a success or a specific status
            return NextResponse.json({ message: "User cart not found, nothing to delete." }, { status: 200 });
        }

        const { error } = await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId)
            .eq('product_id', productId);

        if (error) {
            console.error("Error deleting item from cart_items:", error);
            throw error;
        }

        return NextResponse.json({ message: "Item removed from cart successfully" });

    } catch (error: any) {
        console.error("Error in DELETE /api/cart/item:", error);
        return NextResponse.json({ error: "Failed to remove item from cart.", details: error.message }, { status: 500 });
    }
}