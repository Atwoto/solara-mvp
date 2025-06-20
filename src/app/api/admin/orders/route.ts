// src/app/api/admin/orders/route.ts

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  try {
    // **THE FIX IS HERE**: We are now using a simpler, more direct query.
    // We will fetch the user email in a follow-up step.
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`*`) // Select all columns from the orders table
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error fetching orders:", error);
      throw error;
    }

    return NextResponse.json(orders);

  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}