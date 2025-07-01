// src/app/api/admin/dashboard/new-customers-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // <<--- CORRECTED IMPORT PATH
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

/*
  SQL Function this route depends on:
  CREATE OR REPLACE FUNCTION count_new_users_per_day_in_range(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
  RETURNS TABLE(day DATE, new_user_count BIGINT) ...
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
    const today = new Date();
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 6);
    startDate.setUTCHours(0,0,0,0);

    const { data: dailyNewCustomers, error: rpcError } = await supabaseAdmin
      .rpc('count_new_users_per_day_in_range', { 
        start_date: startDate.toISOString(), 
        end_date: endDate.toISOString() 
      });

    if (rpcError) {
      console.error('API: Error calling RPC count_new_users_per_day_in_range:', JSON.stringify(rpcError, null, 2));
      throw rpcError;
    }

    const labels: string[] = [];
    const dataPoints: number[] = [];

    if (dailyNewCustomers && Array.isArray(dailyNewCustomers)) {
        dailyNewCustomers.forEach((item: { day: string; new_user_count: number }) => {
            labels.push(new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            dataPoints.push(item.new_user_count);
        });
    }
    
    return NextResponse.json({ labels, data: dataPoints });

  } catch (error: any) {
    console.error('API: Error fetching new customers chart data:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch new customers chart data', error: error.message }, { status: 500 });
  }
}