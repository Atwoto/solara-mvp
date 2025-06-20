// src/app/api/admin/dashboard/order-status-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from 'next-auth'; // Make sure Session type is correctly augmented via next-auth.d.ts

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

interface OrderStatusCountFromRPC {
  status: string;
  count: number;
}

export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/dashboard/order-status-chart hit");
  const session = await getServerSession(authOptions) as Session | null; // Cast to your augmented Session

  // Log the raw session object for this specific API route
  console.log("API ORDER STATUS CHART - Raw session object:", JSON.stringify(session, null, 2));

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    console.error(
        "API ORDER STATUS CHART: Unauthorized access attempt. Session details below.",
        "Is session null?", !session,
        "Is session.user null/undefined?", !session?.user,
        "User email:", session?.user?.email,
        "Admin email expected:", ADMIN_EMAIL,
        "Does email match?", session?.user?.email === ADMIN_EMAIL
    );
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  
  console.log("API ORDER STATUS CHART: Admin authenticated:", session.user.email);

  if (!supabaseAdmin) {
    console.error("API ORDER STATUS CHART: Supabase admin client not initialized!");
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('group_order_status_counts');

    if (rpcError) {
      console.error('API ORDER STATUS CHART: Error calling RPC group_order_status_counts:', JSON.stringify(rpcError, null, 2));
      return NextResponse.json({ message: 'Database error fetching order statuses', error: rpcError.message }, { status: 500 });
    }

    const statusCounts = rpcResult as OrderStatusCountFromRPC[] | null;
    const labels = statusCounts?.map((item) => item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) || [];
    const data = statusCounts?.map((item) => item.count) || [];

    console.log("API ORDER STATUS CHART: Data - Labels:", labels, "Data points:", data);
    return NextResponse.json({ labels, data });

  } catch (error: any) {
    console.error('API ORDER STATUS CHART: Unhandled error:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch order status chart data', error: error.message }, { status: 500 });
  }
}