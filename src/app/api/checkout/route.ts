// src/app/api/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
    console.warn("Paystack secret key is not set. Payments will not be verifiable.");
}

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { cartItems, shippingDetails, total } = await req.json();

    try {
        // Create a unique reference for the order using the user's ID and timestamp
        const reference = `billsonsolar_${session.user.id}_${Date.now()}`;
        
        const newOrder = {
            user_id: session.user.id,
            total_price: total,
            status: 'Pending payment', // Initial status
            shipping_address: shippingDetails,
            order_items: cartItems,
            paystack_reference: reference, // Save the reference
        };

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