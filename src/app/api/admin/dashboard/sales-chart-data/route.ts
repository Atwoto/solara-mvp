// src/app/api/admin/dashboard/sales-chart-data/route.ts -- FINAL, COMPATIBLE VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

// Define the type for order data
interface DailyOrder {
  total_price: number | null;
}

export async function GET(request: NextRequest) {
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

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setUTCDate(today.getUTCDate() - i);
      
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      labels.push(startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // --- THIS IS THE CORRECTED QUERY ---
      // We removed the `.returns()` method.
      const { data: dailyOrders, error: dailyOrdersError } = await supabaseAdmin
        .from('orders')
        .select('total_price')
        .in('status', ['paid', 'delivered', 'shipped', 'processing'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (dailyOrdersError) {
        console.error(`Error fetching orders for ${startDate.toISOString()}:`, dailyOrdersError.message);
        dataPoints.push(0);
        continue;
      }
      
      // We add a type assertion here to tell TypeScript we know what `dailyOrders` is.
      const typedOrders = dailyOrders as DailyOrder[] | null;

      const dailyTotal = typedOrders?.reduce((sum: number, order: DailyOrder) => {
        const price = typeof order.total_price === 'number' ? order.total_price : 0;
        return sum + price;
      }, 0) || 0;

      dataPoints.push(dailyTotal);
    }

    return NextResponse.json({ labels, data: dataPoints });

  } catch (error: any) {
    console.error('API: Error fetching sales chart data:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch sales chart data', error: error.message }, { status: 500 });
  }
}