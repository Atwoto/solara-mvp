import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(body).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const chargeData = event.data;
    // Use the database order ID we stored in metadata
    const dbOrderId = chargeData.metadata?.db_order_id; 

    if (dbOrderId) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', dbOrderId);
        // TODO: Here you would trigger a confirmation email to the user
    }
  }

  return NextResponse.json({ received: true });
}