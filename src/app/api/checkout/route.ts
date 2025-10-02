// src/app/api/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
    console.warn("Paystack secret key is not set. Payments will not be verifiable.");
}

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    const { cartItems, shippingDetails, total, isGuestCheckout } = await req.json();
    
    // If not authenticated and not a guest checkout, return unauthorized
    if (!session && !isGuestCheckout) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Create a unique reference for the order
        const reference = `billsonsolar_${isGuestCheckout ? 'guest' : session.user.id}_${Date.now()}`;
        
        const newOrder: any = {
            total_price: total,
            status: 'Pending payment', // Initial status
            shipping_address: shippingDetails,
            order_items: cartItems,
            paystack_reference: reference, // Save the reference
        };

        // Only add user_id if the user is authenticated
        if (session) {
            newOrder.user_id = session.user.id;
        } else if (isGuestCheckout) {
            // For guest checkout, we don't have a user_id, but we have the email in shipping details
            newOrder.user_email = shippingDetails.email; // Store the email for guest orders
        }

        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert(newOrder)
            .select()
            .single();

        if (orderError) throw orderError;
        
        return NextResponse.json({
            message: 'Order created successfully',
            orderId: orderData.id,
            paystack: { reference: reference },
        });
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}