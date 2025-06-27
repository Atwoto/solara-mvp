// /src/app/api/paystack/initialize/route.ts -- FINAL, NO-LIBRARY VERSION

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import https from 'https'; // Use the built-in Node.js HTTPS module

export const runtime = 'nodejs'; // This is correct, as we need Node.js modules

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("CRITICAL ERROR: PAYSTACK_SECRET_KEY is not set.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const { amount, email, metadata } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0 || !email) {
      return NextResponse.json({ error: 'Valid amount and email are required.' }, { status: 400 });
    }

    const amountInSmallestUnit = Math.round(amount * 100);
    const reference = `BOS_${metadata?.db_order_id || 'ORDER'}_${uuidv4()}`;

    const params = JSON.stringify({
      "email": email,
      "amount": amountInSmallestUnit,
      "currency": "KES",
      "reference": reference,
      "metadata": metadata
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': params.length
      }
    };

    // --- THE FINAL FIX: A direct HTTPS request that is guaranteed to work ---
    const responseData = await new Promise<any>((resolve, reject) => {
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        apiRes.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Failed to parse Paystack's response."));
          }
        });
      }).on('error', error => {
        reject(error);
      });

      apiReq.write(params);
      apiReq.end();
    });
    // --- END OF HTTPS REQUEST ---

    if (!responseData.status || !responseData.data?.authorization_url) {
      console.error('Paystack API returned an error:', responseData);
      throw new Error(responseData.message || 'Failed to initialize payment with Paystack.');
    }
    
    // Return the successful response data to our /api/checkout route.
    return NextResponse.json(responseData.data);

  } catch (error: any) {
    console.error('CRITICAL PAYSTACK INIT ERROR:', error.message);
    return NextResponse.json({ error: 'Paystack initialization failed.', details: error.message }, { status: 500 });
  }
}