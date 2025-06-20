// src/app/api/cart/item/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CartItem, Product as AppProductType } from '@/types';

// Define the expected shape of the database response
interface CartItemWithProduct {
    quantity: number;
    product_id: string;
    products: AppProductType | null;
}

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

// Helper to validate product data
function isValidProduct(product: any): product is AppProductType {
    return product && 
           typeof product.id === 'string' &&
           typeof product.name === 'string' &&
           typeof product.price === 'number' &&
           product.created_at !== undefined;
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

        // First, verify the product exists
        const { data: productExists, error: productError } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('id', productId)
            .single();

        if (productError || !productExists) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        // Update the cart item quantity
        const { data: updatedItem, error } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .select(`
                quantity, 
                product_id,
                products!inner (
                    id, 
                    name, 
                    price, 
                    imageUrl, 
                    wattage, 
                    category, 
                    description, 
                    created_at
                )
            `)
            .single();

        if (error) {
            console.error("Error updating cart item quantity:", error);
            if (error.code === 'PGRST116') { 
                return NextResponse.json({ error: "Item not found in cart to update." }, { status: 404 });
            }
            throw error;
        }
        
        // Type-safe validation of the response
        const typedUpdatedItem = updatedItem as CartItemWithProduct;
        
        if (!typedUpdatedItem || !typedUpdatedItem.products || !isValidProduct(typedUpdatedItem.products)) {
            console.error("Invalid product data received:", typedUpdatedItem);
            return NextResponse.json({ error: "Failed to retrieve valid product details." }, { status: 500 });
        }
        
        const cartItem: CartItem = {
            ...typedUpdatedItem.products,
            quantity: typedUpdatedItem.quantity,
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