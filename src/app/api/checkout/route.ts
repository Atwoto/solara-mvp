// src/app/api/checkout/route.ts -- FINAL, CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CartItem } from '@/types';
import type { Session } from 'next-auth';

// Define the shape of the data returned by the Supabase insert query for a new order
interface NewOrderResponse {
    id: string;
    created_at: string;
    user_id: string;
}

interface ShippingDetails {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
}

interface OrderDetailsRequestBody {
  cartItems: CartItem[];
  shippingDetails: ShippingDetails;
  total: number;
  paymentReference: string;
  paymentStatus?: string;
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }

  let orderIdToDeleteOnError: string | null = null;

  try {
    const body = await req.json() as OrderDetailsRequestBody;
    const { 
      cartItems, 
      shippingDetails, 
      total, 
      paymentReference,
      paymentStatus = 'pending_verification'
    } = body;

    if (!cartItems || cartItems.length === 0 || !shippingDetails || !total || !paymentReference) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    // --- THIS IS THE CORRECTED QUERY ---
    // We removed the `.single<NewOrderResponse>()` and will assert the type below.
    const { data: newOrderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: session.user.id,
        total_price: total,
        status: paymentStatus,
        shipping_address: shippingDetails,
        paystack_reference: paymentReference,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order in DB:", orderError);
      throw new Error(orderError?.message || "Failed to save order details.");
    }
    
    // Use type assertion here to tell TypeScript what `newOrderData` is.
    const newOrder = newOrderData as NewOrderResponse;
    if (!newOrder) {
        throw new Error("Failed to save order details or retrieve the new order.");
    }

    const orderId = newOrder.id;
    orderIdToDeleteOnError = orderId;

    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
      product_name: item.name 
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error(`Error creating order items for order ${orderId}:`, itemsError);
      throw new Error(itemsError.message || "Failed to save order items.");
    }

    return NextResponse.json({ message: 'Order received, awaiting payment confirmation.', orderId: orderId });

  } catch (error: any) {
    console.error('Checkout API error:', error);
    if (orderIdToDeleteOnError) {
        console.log(`Attempting to roll back failed order: ${orderIdToDeleteOnError}`);
        await supabaseAdmin.from('orders').delete().eq('id', orderIdToDeleteOnError);
    }
    return NextResponse.json({ error: error.message || 'Failed to process checkout.' }, { status: 500 });
  }
}