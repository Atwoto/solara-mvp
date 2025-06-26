// src/app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'; // Node.js crypto module for verifying webhook signature
import { supabaseAdmin as supabase } from '@/lib/supabase/server';// Use admin client to update DB

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!PAYSTACK_WEBHOOK_SECRET) {
    console.error("Paystack webhook secret not configured.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized for Paystack webhook.");
    return NextResponse.json({ error: "Database client not available." }, { status: 500 });
  }

  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text(); // Get raw body as text for signature verification

  if (!signature) {
    console.warn("Paystack webhook: Missing signature.");
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify the webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.warn("Paystack webhook: Invalid signature.");
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // If signature is valid, parse the body as JSON
  let event;
  try {
    event = JSON.parse(body);
  } catch (err) {
    console.error("Paystack webhook: Invalid JSON payload.", err);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  
  console.log("Paystack Webhook Event Received:", event.event, "Data:", event.data);

  // Handle the event
  switch (event.event) {
    case 'charge.success':
      const chargeData = event.data;
      const paystackReference = chargeData.reference;
      const orderIdFromMetadata = chargeData.metadata?.order_id; // Or however you store your order ID

      console.log(`Processing charge.success for reference: ${paystackReference}, orderId: ${orderIdFromMetadata}`);

      // IMPORTANT: Idempotency - Ensure you don't process the same event multiple times
      // You might check if the order linked to this reference/orderId is already marked as paid.

      // Find the order in your database using the reference or metadata.order_id
      // The reference from chargeData.reference should match the one you saved when initializing.
      // Or, if you stored your internal orderId in metadata, use that.
      
      // Let's assume you use the Paystack reference to find your order.
      // You might need a column in your 'orders' table like 'paystack_reference'.
      // Or if you embedded your orderId in Paystack's reference (e.g., BOS_YOUR_ORDER_ID_...)
      // you'll need to parse it out.

      if (!orderIdFromMetadata || orderIdFromMetadata === "N/A") {
          console.warn(`charge.success webhook: order_id not found in metadata for Paystack reference ${paystackReference}. Manual reconciliation may be needed.`);
          // Depending on your logic, you might still try to update based on paystackReference if you store it.
          // For now, we'll only proceed if we have a clear orderId from metadata.
          return NextResponse.json({ message: 'Order ID missing in metadata.' }, { status: 200 }); // Acknowledge receipt
      }

      try {
        // Update the order status in your 'orders' table
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'Paid', // Or 'Processing', 'Completed'
            paystack_reference: paystackReference, // Store the reference
            // You might also store other details like payment_method, fees, etc.
          })
          .eq('id', orderIdFromMetadata) // Assuming orderIdFromMetadata is your DB order ID
          .select()
          .single();

        if (updateError) {
          console.error(`Error updating order ${orderIdFromMetadata} for Paystack ref ${paystackReference}:`, updateError);
          // Don't return 500 if the webhook itself was valid, Paystack will retry.
          // Log error and potentially send alert for manual check.
          return NextResponse.json({ message: 'Error updating order status, but webhook received.' }, { status: 200 });
        }

        if (updatedOrder) {
            console.log(`Order ${orderIdFromMetadata} successfully updated to Paid. Paystack Ref: ${paystackReference}`);
            // TODO: Trigger post-payment actions (e.g., send confirmation email, notify fulfillment)
        } else {
            console.warn(`Order ${orderIdFromMetadata} not found for Paystack ref ${paystackReference} during update, or update returned no data.`);
        }

      } catch (dbError) {
        console.error(`Database error during webhook processing for order ${orderIdFromMetadata}, Paystack ref ${paystackReference}:`, dbError);
        return NextResponse.json({ message: 'Database error processing webhook.' }, { status: 200 }); // Acknowledge to Paystack
      }
      break;

    // Add other event types you want to handle
    // case 'transfer.success':
    //   // handle transfer success
    //   break;
    // case 'subscription.create':
    //   // handle subscription creation
    //   break;
    default:
      console.log(`Unhandled Paystack event type: ${event.event}`);
  }

  // Acknowledge receipt of the event to Paystack
  return NextResponse.json({ received: true }, { status: 200 });
}