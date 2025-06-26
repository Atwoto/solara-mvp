// src/app/api/admin/dashboard/order-status-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // <<--- CORRECTED IMPORT PATH
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

interface OrderStatusCountFromRPC {
  status: string;
  count: number;
}

/*
  SQL Function this route depends on:
  CREATE OR REPLACE FUNCTION group_order_status_counts()
  RETURNS TABLE(status TEXT, count BIGINT) ...
*/

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('group_order_status_counts');

    if (rpcError) {
      console.error('API: Error calling RPC group_order_status_counts:', JSON.stringify(rpcError, null, 2));
      throw rpcError;
    }

    const statusCounts = rpcResult as OrderStatusCountFromRPC[] | null;
    const labels = statusCounts?.map((item) => item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) || [];
    const data = statusCounts?.map((item) => item.count) || [];

    return NextResponse.json({ labels, data });
  } catch (error: any) {
    console.error('API: Error fetching order status chart data:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch order status chart data', error: error.message }, { status: 500 });
  }
}