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
  });

  if (!session && !isGuestCheckout) {
    console.log("Authorization failed: No session and not guest checkout");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reference = `billsonsolar_${session ? session.user.id.substring(0, 8) : "guest"}_${Date.now()}`;
    const email = session ? session.user.email : shippingDetails.email;
    const amount = total * 100; // Convert to kobo/cents

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for payment" },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
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

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack API Error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // Create order in Supabase
    const newOrder: any = {
      total_price: total,
      status: "Pending payment",
      shipping_address: shippingDetails,
      order_items: cartItems,
      shipping_cost: shippingDetails.shipping_cost || 0,
      paystack_reference: reference,
    };

    if (session) {
      newOrder.user_id = session.user.id;
    } else if (isGuestCheckout) {
      newOrder.user_email = shippingDetails.email;
    }

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
