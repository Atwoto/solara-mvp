// src/app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    console.error("FATAL: PAYSTACK_SECRET_KEY is not set!");
}

export async function POST(req: NextRequest) {
    console.log("Paystack webhook received.");
    if (!PAYSTACK_SECRET_KEY) {
        console.error("Webhook Error: Paystack secret key is not configured.");
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const signature = req.headers.get('x-paystack-signature');
        const body = await req.text();

        if (!signature) {
            console.error("Webhook Error: No x-paystack-signature header found.");
            return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
        }

        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(body)
            .digest('hex');

        if (hash !== signature) {
            console.error("Webhook Error: Invalid signature.");
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        console.log("Paystack event:", JSON.stringify(event, null, 2));

        if (event.event === 'charge.success') {
            console.log("Processing charge.success event.");
            const { reference, status } = event.data;

            if (status !== 'success') {
                console.log(`Charge status is '${status}', not 'success'. No action taken.`);
                return NextResponse.json({ received: true });
            }

            const { data: order, error: findError } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('paystack_reference', reference)
                .single();
            
            if (findError || !order) {
                console.error(`Webhook Error: Order with reference ${reference} not found.`);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            if (order.status === 'Processing' || order.status === 'Completed') {
                console.log(`Order ${order.id} has already been processed. No action taken.`);
                return NextResponse.json({ received: true });
            }

            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ 
                    status: 'Processing',
                    payment_details: event.data // Save the full payment details
                })
                .eq('id', order.id);

            if (updateError) {
                console.error(`Webhook Error: Failed to update order ${order.id}.`, updateError);
                throw updateError;
            }

            console.log(`Order ${order.id} successfully updated to 'Processing'.`);
        } else {
            console.log(`Received event '${event.event}', which is not 'charge.success'. No action taken.`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("Webhook processing failed:", error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}