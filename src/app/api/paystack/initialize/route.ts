// src/app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Paystack from 'paystack-node';
import { useSession } from 'next-auth/react'; // This hook can't be used in API routes directly
                                         // We'd get session info from the request if needed or pass it from client
import { getServerSession } from "next-auth/next" // For getting session server-side
import { authOptions } from "@/lib/auth"; // Your NextAuth options

const environment = process.env.NODE_ENV || 'development';
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!, environment); // Add '!' if you're sure it's set

export async function POST(req: NextRequest) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Paystack secret key not configured.");
    return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions); // Get session server-side
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    const { amount, email, currency = 'KES', orderId, cartItems } = await req.json(); // amount should be in lowest currency unit (e.g., kobo, cents)

    if (!amount || amount <= 0 || !email) {
      return NextResponse.json({ error: 'Invalid request: Amount and email are required.' }, { status: 400 });
    }
    if (!orderId) {
        // In a real scenario, you'd create a pending order in your DB first and get an orderId
        console.warn("orderId not provided for Paystack transaction initialization. Using a temporary one.");
        // For now, we can proceed without a persistent orderId, but it's crucial for reconciliation
    }


    // Amount must be in kobo for KES (multiply by 100)
    const amountInKobo = Math.round(amount * 100);

    const transaction = await paystack.transaction.initialize({
      amount: amountInKobo,
      email: email, // Customer's email
      currency: currency,
      // reference: `order_${orderId}_${Date.now()}`, // Generate a unique reference for this transaction
      reference: `BOS_${orderId || 'temp'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique reference
      metadata: { // Optional: store additional info
        order_id: orderId || "N/A", // Your internal order ID
        user_id: session.user.id, // If you have user IDs
        // cart_items: JSON.stringify(cartItems), // Be careful with PII and size limits
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: orderId || "N/A"
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: session.user.name || "N/A"
          }
        ]
      },
      // callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation`, // Paystack will redirect here after payment
                                                                            // Or handle client-side with onSuccess
    });

    if (!transaction.status || !transaction.data?.authorization_url) {
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