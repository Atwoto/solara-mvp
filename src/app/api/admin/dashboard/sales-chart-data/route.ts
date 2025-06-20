// src/app/api/admin/dashboard/sales-chart-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/dashboard/sales-chart-data hit");
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const today = new Date();
    const labels: string[] = [];
    const dataPoints: number[] = [];

    // Get data for the last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setUTCDate(today.getUTCDate() - i); // Go back i days from today (UTC)
      
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth(); // 0-11
      const day = date.getUTCDate();

      // Start of the day in UTC
      const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      // End of the day in UTC
      const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      labels.push(startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const { data: dailyOrders, error: dailyOrdersError } = await supabaseAdmin
        .from('orders')
        .select('total_price')
        .in('status', ['paid', 'delivered', 'shipped', 'processing']) // Define what counts as revenue
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (dailyOrdersError) {
        console.error(`Error fetching orders for ${startDate.toISOString()}:`, dailyOrdersError.message);
        dataPoints.push(0); // Push 0 if there's an error for that day
        continue;
      }
      
      const dailyTotal = dailyOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
      dataPoints.push(dailyTotal);
    }

    return NextResponse.json({ labels, data: dataPoints });

  } catch (error: any) {
    console.error('API: Error fetching sales chart data:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch sales chart data', error: error.message }, { status: 500 });
  }
}