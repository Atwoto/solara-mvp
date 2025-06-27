// /src/app/api/paystack/initialize/route.ts -- FINAL CORRECTED VERSION

import { NextRequest, NextResponse } from 'next/server';
import Paystack from 'paystack-node';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique references

// This is the correct way to initialize the client.
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

// We are telling Vercel to use the Node.js runtime, which is correct.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { amount, email, metadata } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0 || !email) {
      return NextResponse.json({ error: 'Valid amount and email are required.' }, { status: 400 });
    }

    // Paystack expects the amount in the smallest currency unit (kobo for NGN, pesewas for GHS, cents for KES).
    const amountInSmallestUnit = Math.round(amount * 100);

    // Create a unique reference for every transaction.
    const reference = `BOS_${metadata?.db_order_id || 'ORDER'}_${uuidv4()}`;

    const transaction = await paystack.transaction.initialize({
      amount: amountInSmallestUnit,
      email: email,
      currency: 'KES',
      reference: reference, // Use the unique reference
      metadata: metadata,
    });
    
    // The library's response structure is nested under 'data'.
    if (!transaction.status || !transaction.data?.authorization_url) {
      console.error('Paystack initialization response was not successful:', transaction.message);
      throw new Error(transaction.message || 'Failed to initialize payment with Paystack.');
    }
    
    // Return the successful response data to the /api/checkout route.
    return NextResponse.json(transaction.data);

  } catch (error: any) {
    console.error('CRITICAL PAYSTACK INIT ERROR:', error);
    // Provide a more specific error message if possible
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred during payment initialization.';
    return NextResponse.json({ error: 'Paystack initialization failed.', details: errorMessage }, { status: 500 });
  }
}