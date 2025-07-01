// /src/app/api/admin/dashboard/stats/route.ts -- FINAL, CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

// Define the type for the specific data we are selecting
interface RevenueOrder {
  total_amount: number | null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // --- Fetch Total Revenue ---
    const { data: revenueOrders, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total_amount') // <-- FIX: Changed from total_price
      .in('status', ['paid', 'delivered', 'shipped', 'processing']);
      
    if (revenueError) throw new Error(`Failed to fetch revenue: ${revenueError.message}`);
    
    const totalRevenue = (revenueOrders as RevenueOrder[])?.reduce((sum: number, order: RevenueOrder) => {
      // <-- FIX: Changed from total_price
      const amount = typeof order.total_amount === 'number' ? order.total_amount : 0;
      return sum + amount;
    }, 0) || 0;
    
    // --- Fetch Other Stats ---
    const startOfMonthISO = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { count: newOrdersCount, error: newOrdersError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonthISO);
    if (newOrdersError) throw new Error(`Failed to fetch new orders count: ${newOrdersError.message}`);

    const { data: newCustomersThisMonth, error: newCustomersError } = await supabaseAdmin
      .rpc('count_new_users_this_month');
    if (newCustomersError) throw new Error(`Failed to fetch new customers count: ${newCustomersError.message}`);

    const { data: totalOverallCustomers, error: totalCustomersError } = await supabaseAdmin
      .rpc('count_total_users');
    if (totalCustomersError) throw new Error(`Failed to fetch total customers: ${totalCustomersError.message}`);

    const { count: totalProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (productsError) throw new Error(`Failed to fetch total products: ${productsError.message}`);

    const { count: totalArticles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });
    if (articlesError) throw new Error(`Failed to fetch total articles: ${articlesError.message}`);

    const stats = {
      totalRevenue,
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