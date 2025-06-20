// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient'; // Use admin client for DB writes
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Your NextAuth options
import { CartItem } from '@/context/CartContext'; // Assuming this type is defined
import { Product } from '@/types'; // Or your specific type for what's in cartItems

interface ShippingDetails {
  fullName: string;
  email?: string; // Email from session
  phone: string;
  address: string;
}

interface OrderDetailsRequestBody {
  cartItems: CartItem[]; // Or Product[] if that's what you store in cart
  shippingDetails: ShippingDetails;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentReference: string; // Paystack reference from client-side callback
  paymentStatus?: string; // Initial status from client-side, e.g., 'pending_webhook_verification'
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized for checkout.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) { // Check for user.id if you use it as foreign key
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json() as OrderDetailsRequestBody;

    const { 
      cartItems, 
      shippingDetails, 
      subtotal, 
      shippingCost, 
      total, 
      paymentReference,
      paymentStatus = 'pending_verification' // Default status
    } = body;

    if (!cartItems || cartItems.length === 0 || !shippingDetails || !total || !paymentReference) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    // 1. Create the main order record
    // Ensure your 'orders' table has columns for user_id, total_price, status, shipping_address, paystack_reference etc.
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: session.user.id, // Foreign key to your users table
        total_price: total,
        status: paymentStatus, // e.g., 'pending_verification', 'processing'
        shipping_address: shippingDetails, // Assuming shipping_address is a JSONB column
        paystack_reference: paymentReference,
        // You might also store subtotal, shipping_cost if needed
      })
      .select() // Select the newly created order
      .single();

    if (orderError || !newOrder) {
      console.error("Error creating order in DB:", orderError);
      throw new Error(orderError?.message || "Failed to save order details.");
    }

    const orderId = newOrder.id;

    // 2. Create order items records
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id, // Foreign key to your products table
      quantity: item.quantity,
      price_at_purchase: item.price, // Store price at time of purchase
      product_name: item.name // Store name for easier display in order summaries
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items') // Your order items table name
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error(`Error creating order items for order ${orderId}:`, itemsError);
      // CRITICAL: Order created but items failed. Need rollback or manual fix.
      // For simplicity, we'll throw, but a real app needs robust transaction/rollback.
      // You might try to delete the order created in step 1 if items fail.
      await supabaseAdmin.from('orders').delete().eq('id', orderId);
      throw new Error(itemsError.message || "Failed to save order items.");
    }

    // 3. Optionally, clear user's server-side cart if you manage one (localStorage cart is cleared client-side)

    return NextResponse.json({ message: 'Order received, awaiting payment confirmation.', orderId: orderId });

  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process checkout.' }, { status: 500 });
  }
}