// /src/app/api/paystack/initialize/route.ts -- FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';

// Helper function to make direct HTTPS requests to Paystack API
function initializePaystackTransaction(data: any, secretKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error('Invalid JSON response from Paystack'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set in environment variables');
      return NextResponse.json({ 
        error: 'Payment service configuration error.' 
      }, { status: 500 });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body. Expected JSON.' 
      }, { status: 400 });
    }

    const { amount, email, metadata } = requestBody;

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        error: 'Valid amount (positive number) is required.' 
      }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ 
        error: 'Valid email address is required.' 
      }, { status: 400 });
    }

    // Convert amount to smallest currency unit (kobo for KES)
    const amountInSmallestUnit = Math.round(amount * 100);
    
    // Generate unique reference
    const reference = `BOS_${metadata?.db_order_id || 'ORDER'}_${uuidv4()}`;

    // Prepare transaction data
    const transactionData = {
      amount: amountInSmallestUnit,
      email: email,
      currency: 'KES',
      reference: reference,
      ...(metadata && { metadata: metadata }),
    };

    console.log('Initializing Paystack transaction with data:', {
      ...transactionData,
      metadata: metadata ? 'present' : 'none'
    });

    // Make direct API call to Paystack
    const response = await initializePaystackTransaction(transactionData, secretKey);
    
    // Validate Paystack response
    if (!response.status || !response.data?.authorization_url) {
      console.error('Paystack initialization failed:', response);
      return NextResponse.json({ 
        error: 'Payment initialization failed.',
        details: response.message || 'Unknown error from payment service'
      }, { status: 500 });
    }
    
    console.log('Paystack transaction initialized successfully:', {
      reference: response.data.reference,
      access_code: response.data.access_code
    });
    
    return NextResponse.json({
      status: true,
      message: 'Transaction initialized successfully',
      data: response.data
    });

  } catch (error: any) {
    console.error('CRITICAL PAYSTACK INIT ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({ 
      error: 'Payment initialization failed.',
      details: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}

/* 
Alternative implementation using fetch (replace the main POST function with this if preferred):

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set');
      return NextResponse.json({ 
        error: 'Payment service configuration error.' 
      }, { status: 500 });
    }

    const { amount, email, metadata } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0 || !email) {
      return NextResponse.json({ 
        error: 'Valid amount and email are required.' 
      }, { status: 400 });
    }

    const amountInSmallestUnit = Math.round(amount * 100);
    const reference = `BOS_${metadata?.db_order_id || 'ORDER'}_${uuidv4()}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        email: email,
        currency: 'KES',
        reference: reference,
        metadata: metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Paystack API error:', response.status, errorData);
      throw new Error(`Paystack API returned ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    
    if (!result.status || !result.data?.authorization_url) {
      console.error('Paystack initialization response invalid:', result);
      throw new Error(result.message || 'Invalid response from Paystack');
    }
    
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error('PAYSTACK INIT ERROR:', error);
    return NextResponse.json({ 
      error: 'Paystack initialization failed.',
      details: error.message 
    }, { status: 500 });
  }
}
*/