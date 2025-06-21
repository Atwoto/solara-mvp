// src/app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Paystack from 'paystack-node';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

// Ensure the PAYSTACK_SECRET_KEY is defined
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
if (!paystackSecretKey) {
  console.error("CRITICAL: Paystack secret key is not configured.");
}

// Initialize Paystack client. It's safe to do this once at the module level.
// The library should handle the environment string correctly.
const paystack = new Paystack(paystackSecretKey!, process.env.NODE_ENV);

export async function POST(req: NextRequest) {
  if (!paystackSecretKey) {
    return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session || !session.user?.id || !session.user.email) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    // It's better to get cart/order details from the server-side to prevent tampering,
    // but for now, we'll trust the body from the client.
    const { amount, currency = 'KES', orderId } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request: A valid amount is required.' }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid request: An order ID is required.' }, { status: 400 });
    }

    // Amount must be in the lowest currency unit (kobo for NGN, pesewas for GHS, cents for USD).
    // For KES (Kenyan Shilling), Paystack expects the value in kobo (100 kobo = 1 KES), which is equivalent to cents.
    // So we multiply the amount in Shillings by 100.
    const amountInSmallestUnit = Math.round(amount * 100);

    const transaction = await paystack.transaction.initialize({
      amount: amountInSmallestUnit,
      email: session.user.email, // Use the authenticated user's email for reliability
      currency: currency,
      reference: `BOS_${orderId}_${uuidv4()}`, // A more robust unique reference
      metadata: {
        order_id: orderId,
        user_id: session.user.id,
        customer_name: session.user.name || "N/A"
      },
      // callback_url is optional if you handle success with the Paystack Popup's `onSuccess` callback on the client.
      // If you define it, Paystack will redirect to this URL after payment.
      // callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?reference=...`, 
    });

    // Check the response from Paystack
    if (!transaction || !transaction.status || !transaction.data?.authorization_url) {
      console.error('Paystack initialization failed:', transaction.message);
      return NextResponse.json({ error: transaction.message || 'Failed to initialize payment.' }, { status: 500 });
    }

    // Return the data needed by the client to open the Paystack popup/redirect
    return NextResponse.json({ 
      authorization_url: transaction.data.authorization_url,
      access_code: transaction.data.access_code,
      reference: transaction.data.reference,
    });

  } catch (error: any) {
    console.error('Error initializing Paystack transaction:', error);
    return NextResponse.json({ error: 'Could not initiate payment.', details: error.message }, { status: 500 });
  }
}