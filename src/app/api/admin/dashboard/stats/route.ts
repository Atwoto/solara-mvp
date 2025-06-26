// src/app/api/admin/dashboard/stats/route.ts -- FINAL, CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

// Define the type for the specific data we are selecting
interface RevenueOrder {
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
    const { data: revenueOrders, error: revenueQueryError } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .in('status', ['paid', 'delivered', 'shipped', 'processing']);
      
    if (revenueQueryError) {
      console.error("API STATS: Supabase error fetching revenue orders:", JSON.stringify(revenueQueryError, null, 2));
      // Throw an error to be caught by the main catch block
      throw new Error(`Failed to fetch revenue: ${revenueQueryError.message}`);
    }
    
    // --- THE FIX IS HERE ---
    // We explicitly type 'sum' as a number and 'order' as our RevenueOrder interface.
    const totalRevenue = (revenueOrders as RevenueOrder[])?.reduce((sum: number, order: RevenueOrder) => {
      const price = typeof order.total_price === 'number' ? order.total_price : 0;
      return sum + price;
    }, 0) || 0;
    
    // --- Continue fetching other stats ---
    const startOfMonthISO = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { count: newOrdersCount, error: newOrdersError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonthISO);
    if (newOrdersError) throw new Error(`Failed to fetch new orders count: ${newOrdersError.message}`);

    const { data: newCustomersThisMonth, error: newCustomersRpcError } = await supabaseAdmin
      .rpc('count_new_users_this_month');
    if (newCustomersRpcError) throw new Error(`Failed to fetch new customers count: ${newCustomersRpcError.message}`);

    const { data: totalOverallCustomers, error: totalCustomersRpcError } = await supabaseAdmin
      .rpc('count_total_users');
    if (totalCustomersRpcError) throw new Error(`Failed to fetch total customers: ${totalCustomersRpcError.message}`);

    const { count: totalProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (productsError) throw new Error(`Failed to fetch total products: ${productsError.message}`);

    const { count: totalArticles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });
    if (articlesError) throw new Error(`Failed to fetch total articles: ${articlesError.message}`);

    const stats = {
      totalRevenue: totalRevenue,
      newOrdersCount: newOrdersCount || 0,
      newCustomersThisMonth: newCustomersThisMonth || 0,
      totalOverallCustomers: totalOverallCustomers || 0,
      totalProducts: totalProducts || 0,
      totalArticles: totalArticles || 0,
    };
    
    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('API STATS: Critical error in GET stats:', error.message);
    return NextResponse.json({ message: 'Failed to fetch dashboard statistics.', error: error.message }, { status: 500 });
  }
}