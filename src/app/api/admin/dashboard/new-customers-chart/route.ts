// src/app/api/admin/dashboard/new-customers-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

// This SQL function is crucial. Ensure it's created in your Supabase SQL Editor.
// It counts new users per day for a given date range.
/*
CREATE OR REPLACE FUNCTION count_new_users_per_day_in_range(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(day DATE, new_user_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH date_series AS (
    SELECT generate_series(
      date_trunc('day', start_date),
      date_trunc('day', end_date),
      '1 day'::interval
    ) AS day
  )
  SELECT
    ds.day::DATE,
    COUNT(u.id) as new_user_count
  FROM date_series ds
  LEFT JOIN auth.users u ON date_trunc('day', u.created_at AT TIME ZONE 'UTC') = ds.day -- Ensure timezone consistency
  GROUP BY ds.day
  ORDER BY ds.day ASC;
$$;

GRANT EXECUTE ON FUNCTION count_new_users_per_day_in_range(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
*/

export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/dashboard/new-customers-chart hit");
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
    startDate.setUTCDate(endDate.getUTCDate() - 6); // Get data for the last 7 days (today + 6 previous days)
    startDate.setUTCHours(0,0,0,0);


    console.log(`API: Fetching new customers chart data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

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
    
    console.log("API: New Customers chart data - Labels:", labels, "Data:", dataPoints);
    return NextResponse.json({ labels, data: dataPoints });

  } catch (error: any) {
    console.error('API: Error fetching new customers chart data:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch new customers chart data', error: error.message }, { status: 500 });
  }
}