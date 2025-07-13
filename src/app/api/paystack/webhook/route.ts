// src/app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
    try {
        // 1. Verify the request is from Paystack
        const signature = req.headers.get('x-paystack-signature');
        const body = await req.text(); // Get the raw body as text

        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(body)
            .digest('hex');

        if (hash !== signature) {
            console.error("Webhook Error: Invalid signature");
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Parse the event data
        const event = JSON.parse(body);

        // 3. Handle the 'charge.success' event
        if (event.event === 'charge.success') {
            const { reference } = event.data;

            // Find the order with the matching Paystack reference
            const { data: order, error: findError } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('paystack_reference', reference)
                .single();
            
            if (findError || !order) {
                console.error(`Webhook Error: Order with reference ${reference} not found.`);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            // Update the order status to 'Processing'
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ status: 'Processing' })
                .eq('id', order.id);

            if (updateError) {
                console.error(`Webhook Error: Failed to update order ${order.id}.`, updateError);
                throw updateError;
            }

            console.log(`Order ${order.id} successfully updated to 'Processing'.`);
        }

        // 4. Acknowledge receipt of the event
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error("Webhook processing failed:", error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}