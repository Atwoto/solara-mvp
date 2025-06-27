import { NextRequest, NextResponse } from 'next/server';
import Paystack from 'paystack-node';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;
const paystack = new Paystack(paystackSecretKey, process.env.NODE_ENV);

export async function POST(req: NextRequest) {
  try {
    const { amount, email, metadata } = await req.json();
    const amountInKobo = Math.round(amount * 100);

    const transaction = await paystack.transaction.initialize({
      amount: amountInKobo,
      email: email,
      currency: 'KES',
      metadata: metadata, // Pass metadata directly
    });

    if (!transaction.status) throw new Error(transaction.message);

    return NextResponse.json(transaction.data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Paystack initialization failed' }, { status: 500 });
  }
}