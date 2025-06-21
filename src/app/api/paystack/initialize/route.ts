// src/app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Paystack from 'paystack-node';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid'; // <<--- IMPORT uuid HERE

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
if (!paystackSecretKey) {
  console.error("CRITICAL: Paystack secret key is not configured.");
}

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

    const { amount, currency = 'KES', orderId } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request: A valid amount is required.' }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid request: An order ID is required.' }, { status: 400 });
    }

    const amountInSmallestUnit = Math.round(amount * 100);

    const transaction = await paystack.transaction.initialize({
      amount: amountInSmallestUnit,
      email: session.user.email,
      currency: currency,
      // Create a unique reference for this transaction
      reference: `BOS_${orderId}_${uuidv4()}`, 
      metadata: {
        order_id: orderId,
        user_id: session.user.id,
        customer_name: session.user.name || "N/A"
      },
    });

    if (!transaction || !transaction.status || !transaction.data?.authorization_url) {
      console.error('Paystack initialization failed:', transaction.message);
      return NextResponse.json({ error: transaction.message || 'Failed to initialize payment.' }, { status: 500 });
    }

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