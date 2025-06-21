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
    if (error && error.code !== 'PGRST116') { 
        console.error("Error fetching user's cart ID:", error);
        return null;
    }
    return typeof cart?.id === 'string' ? cart.id : null;
}

// Helper to get product details
async function getProductDetails(productId: string): Promise<AppProductType | null> {
    if (!supabaseAdmin) return null;
    
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('id, name, price, imageUrl, wattage, category, description, created_at')
        .eq('id', productId)
        .single();
    
    if (error) {
        console.error("Error fetching product details:", error);
        return null;
    }
    
    return product as AppProductType;
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
            return NextResponse.json({ error: "Invalid request: productId and a positive newQuantity are required." }, { status: 400 });
        }

        const cartId = await getUserCartId(session.user.id);
        if (!cartId) {
            return NextResponse.json({ error: "User cart not found. Add an item first." }, { status: 404 });
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
            .single();

        if (updateError) {
            console.error("Error updating cart item quantity:", updateError);
            if (updateError.code === 'PGRST116') { 
                return NextResponse.json({ error: "Item not found in cart to update." }, { status: 404 });
            }
            throw updateError;
        }

        if (!updatedCartItem) {
            return NextResponse.json({ error: "Failed to update cart item." }, { status: 500 });
        }

        // Combine the product details with the updated quantity
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
    if (!supabaseAdmin) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

    const session = await getServerSession(authOptions);
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
            return NextResponse.json({ message: "User cart not found, nothing to delete." }, { status: 200 });
        }

        // Check if the item exists in the cart before trying to delete
        const { data: existingItem, error: checkError } = await supabaseAdmin
            .from('cart_items')
            .select('product_id')
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .single();

        if (checkError && checkError.code === 'PGRST116') {
            return NextResponse.json({ message: "Item not found in cart." }, { status: 404 });
        }

        if (checkError) {
            console.error("Error checking cart item existence:", checkError);
            throw checkError;
        }

        // Delete the item
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