// src/app/api/checkout/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  console.warn(
    "Paystack secret key is not set. Payments will not be verifiable."
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const { cartItems, shippingDetails, total, isGuestCheckout } =
    await req.json();

  // Debug logging
  console.log("Checkout API Debug:", {
    hasSession: !!session,
    sessionUserId: session?.user?.id,
    isGuestCheckout,
    shippingEmail: shippingDetails?.email,
    shippingDetails: shippingDetails,
    cartItemsCount: cartItems?.length,
    total: total,
  });

  if (!session && !isGuestCheckout) {
    console.log("Authorization failed: No session and not guest checkout");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reference = `billsonsolar_${session ? session.user.id.substring(0, 8) : "guest"}_${Date.now()}`;
    const email = session ? session.user.email : shippingDetails.email;
    const amount = total * 100; // Convert to kobo/cents

    console.log("Payment details:", { email, amount, reference, total });

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for payment" },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    console.log("Initializing Paystack transaction...");
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          reference,
          callback_url: `${req.nextUrl.origin}/order-confirmation?reference=${reference}`,
        }),
      }
    );

    console.log("Paystack response status:", paystackResponse.status);
    const paystackData = await paystackResponse.json();
    console.log("Paystack response data:", paystackData);

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack API Error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // Create order in Supabase
    console.log("Creating order in Supabase...");

    const newOrder: any = {
      total_amount: total,
      status: "pending_payment",
      shipping_address: shippingDetails,
      shipping_details: shippingDetails,
      paystack_reference: reference,
      user_id: session ? session.user.id : null, // Use null for guest orders
    };

    // Add guest email to order for guest checkouts
    if (isGuestCheckout) {
      newOrder.guest_email = shippingDetails.email;
    }

    console.log("Order data to insert:", newOrder);

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert(newOrder)
      .select()
      .single();

    if (orderError) {
      console.error("Supabase Order Error:", orderError);
      return NextResponse.json(
        { error: "Failed to save order after initializing payment." },
        { status: 500 }
      );
    }

    console.log("Order created successfully:", orderData);

    // Now create order items in a separate table (if it exists)
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price, // Use the correct column name from your schema
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        // Don't fail the entire order if items can't be inserted
        // The main order is already created
      }
    }

    return NextResponse.json({
      message: "Order created and payment initialized",
      orderId: orderData.id,
      paystack: {
        reference: reference,
        authorization_url: paystackData.data.authorization_url,
      },
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
