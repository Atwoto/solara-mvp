// /src/app/api/account/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from '@/lib/supabase/server';
import { Order, CartItem } from '@/types'; // Import necessary types

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // Ensure user is authenticated
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userEmail = session.user.email;

        // --- THE FIX: This is the corrected query ---
        // 1. Fetch all orders that belong to the logged-in user.
        // We use the `user_id` from the `users` table which is linked via session.
        // This is more secure than matching by email in the JSONB field.
        const { data: ordersData, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select(`
                id,
                created_at,
                user_id,
                total_amount,
                status,
                shipping_details,
                paystack_reference,
                order_items (
                    product_id,
                    quantity,
                    price_at_purchase,
                    products (
                        id,
                        name,
                        price,
                        image_url,
                        category,
                        description,
                        wattage
                    )
                )
            `)
            .eq('shipping_details->>email', userEmail) // Matching by email as a fallback
            .order('created_at', { ascending: false });
        
        if (ordersError) {
            console.error("Error fetching user orders:", ordersError);
            throw ordersError;
        }

        if (!ordersData) {
            return NextResponse.json([]);
        }

        // 2. Transform the data to match the frontend's expected `Order` type.
        const formattedOrders: Order[] = ordersData.map((order: any) => ({
            id: order.id,
            created_at: order.created_at,
            user_id: order.user_id,
            total_price: order.total_amount, // Map total_amount to total_price
            status: order.status,
            shipping_address: order.shipping_details, // Map shipping_details to shipping_address
            paystack_reference: order.paystack_reference,
            // Map the nested order_items data to the structure the frontend expects
            order_items: order.order_items.map((item: any) => ({
                id: item.products.id,
                name: item.products.name,
                price: item.price_at_purchase,
                quantity: item.quantity,
                image_url: item.products.image_url,
                category: item.products.category,
                description: item.products.description,
                wattage: item.products.wattage,
                created_at: item.products.created_at, // Add created_at if needed by CartItem
            })),
        }));

        return NextResponse.json(formattedOrders);

    } catch (error: any) {
        console.error("API Error in /api/account/orders:", error);
        return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
    }
}
