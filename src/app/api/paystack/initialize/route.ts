// /src/app/api/paystack/initialize/route.ts -- FINAL, ROBUST VERSION

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// --- THE FINAL FIX: Use require() to import the library ---
// This handles module compatibility issues common in serverless environments.
const Paystack = require('paystack-node');

// We are telling Vercel to use the Node.js runtime, which is correct.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Initialize the Paystack client INSIDE the function.
    const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

    const { amount, email, metadata } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0 || !email) {
      return NextResponse.json({ error: 'Valid amount and email are required.' }, { status: 400 });
    }

    const amountInSmallestUnit = Math.round(amount * 100);
    const reference = `BOS_${metadata?.db_order_id || 'ORDER'}_${uuidv4()}`;

    // This will now work because 'paystack' is correctly initialized.
    const transaction = await paystack.transaction.initialize({
      amount: amountInSmallestUnit,
      email: email,
      currency: 'KES',
      reference: reference,
      metadata: metadata,
    });
    
    if (!transaction.status || !transaction.data?.authorization_url) {
      console.error('Paystack initialization response was not successful:', transaction.message);
      throw new Error(transaction.message || 'Failed to initialize payment with Paystack.');
    }
    
    return NextResponse.json(transaction.data);

  } catch (error: any) {
    console.error('CRITICAL PAYSTACK INIT ERROR:', error);
    const errorMessage = error.message || 'An unknown error occurred during payment initialization.';
    return NextResponse.json({ error: 'Paystack initialization failed.', details: errorMessage }, { status: 500 });
  }
}