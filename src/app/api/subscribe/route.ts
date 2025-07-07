// src/app/api/subscribe/route.ts

// src/app/api/subscribe/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Get the email from the request body sent by the footer form
  const { email } = await req.json();

  // Basic validation: Check if email is provided
  if (!email) {
    return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
  }

  // More robust validation: Check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Insert the email into the 'subscribers' table
    const { error } = await supabase.from('subscribers').insert({ email });

    // Handle potential errors from the database
    if (error) {
      // This specific error code '23505' means a unique constraint was violated
      // (the email already exists in the table).
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'This email is already subscribed. Thank you!' },
          { status: 409 } // 409 Conflict is a good status code for this
        );
      }
      // For any other database errors, throw the error to be caught below
      throw error;
    }

    // If successful, return a success message
    return NextResponse.json(
      { message: 'Thank you for subscribing! Stay tuned for updates.' },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('Subscription Error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}