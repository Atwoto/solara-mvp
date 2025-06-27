// /src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cartItems, shippingDetails, subtotal, shippingCost, total } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // --- Create the Order in your Database ---
    // 1. Create the main order record
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_amount: total,
        status: 'pending_payment',
        shipping_details: shippingDetails,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // 2. Create the associated order items
    const orderItemsToInsert = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      // If items fail, we should roll back the order creation for consistency
      await supabaseAdmin.from('orders').delete().eq('id', orderId);
      throw itemsError;
    }

    // 3. Now that the order is safely in our DB, initialize payment with Paystack
    const paystackResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: total,
            email: session.user.email,
            // Pass OUR database order ID to Paystack's metadata
            metadata: {
                db_order_id: orderId,
            }
        })
    });
    
    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(paystackData.error || 'Failed to initialize Paystack payment');
    }
    
    // 4. Update our order with the Paystack reference
    await supabaseAdmin
        .from('orders')
        .update({ paystack_reference: paystackData.reference })
        .eq('id', orderId);

    // 5. Return the Paystack data to the frontend to open the popup
    return NextResponse.json({
        message: 'Order created and payment initialized',
        orderId: orderId,
        paystack: paystackData,
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}