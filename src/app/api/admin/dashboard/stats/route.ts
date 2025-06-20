// src/app/api/admin/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

// Define the type for order data
interface OrderData {
  total_price: number;
}

console.log("STATS API Module Loaded - Supabase URL from env:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("STATS API Module Loaded - Supabase Service Key is defined:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);


export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/dashboard/stats hit");
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    console.error("API STATS: Unauthorized access");
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    console.error("API STATS: Supabase admin client not initialized!");
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  console.log("API STATS: Admin authenticated, supabaseAdmin client available.");

  try {
    console.log("API STATS: Attempting to fetch total revenue...");
    // Simplified revenue query for testing connection
    const { data: revenueOrders, error: revenueQueryError } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .in('status', ['paid', 'delivered', 'shipped', 'processing']);

    if (revenueQueryError) {
      console.error("API STATS: Supabase error fetching revenue orders:", JSON.stringify(revenueQueryError, null, 2));
      // Don't throw yet, let other queries try, but log this failure.
      // We will return a general error later if any part fails.
      // throw revenueQueryError; // This would jump to the outer catch
    }
    
    // Fix the TypeScript error by using type guards
    const totalRevenue = revenueOrders?.reduce((sum, order) => {
      const price = typeof order.total_price === 'number' ? order.total_price : 0;
      return sum + price;
    }, 0) || 0;
    
    console.log("API STATS: Total revenue calculated:", totalRevenue);


    // --- Temporarily comment out other queries to isolate the problem ---
    const startOfMonthISO = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    console.log("API STATS: Attempting to fetch new orders count...");
    const { count: newOrdersCount, error: newOrdersError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonthISO);
    if (newOrdersError) console.error("API STATS: Supabase error fetching new orders count:", JSON.stringify(newOrdersError, null, 2));
    console.log("API STATS: New orders count:", newOrdersCount);

    console.log("API STATS: Attempting to fetch new customers count...");
    const { data: newCustomersData, error: newCustomersRpcError } = await supabaseAdmin
      .rpc('count_new_users_this_month');
    if (newCustomersRpcError) console.warn("API STATS: Warning calling RPC count_new_users_this_month:", newCustomersRpcError.message);
    const newCustomersThisMonth = newCustomersData || 0;
    console.log("API STATS: New customers this month:", newCustomersThisMonth);

    // ... (rest of the queries for totalCustomers, totalProducts, totalArticles with similar logging)
    const { data: totalCustomersData, error: totalCustomersRpcError } = await supabaseAdmin.rpc('count_total_users');
    if (totalCustomersRpcError) console.warn("API STATS: Warning RPC count_total_users:", totalCustomersRpcError.message);
    const totalOverallCustomers = totalCustomersData || 0;
    console.log("API STATS: Total overall customers:", totalOverallCustomers);

    const { count: totalProducts, error: productsError } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });
    if (productsError) console.error("API STATS: Supabase error fetching total products:", JSON.stringify(productsError, null, 2));
    console.log("API STATS: Total products:", totalProducts);

    const { count: totalArticles, error: articlesError } = await supabaseAdmin.from('articles').select('*', { count: 'exact', head: true });
    if (articlesError) console.error("API STATS: Supabase error fetching total articles:", JSON.stringify(articlesError, null, 2));
    console.log("API STATS: Total articles:", totalArticles);


    // If any of the critical queries failed earlier, we might want to return an error status
    if (revenueQueryError || newOrdersError || productsError || articlesError) {
        // Consolidate error messages if you want
        let combinedErrorMessage = "Errors occurred fetching some dashboard data: ";
        if(revenueQueryError) combinedErrorMessage += `Revenue: ${revenueQueryError.message}. `;
        // ... add other errors
        return NextResponse.json({ message: combinedErrorMessage, error: "Multiple data fetch issues" }, { status: 500 });
    }


    const stats = {
      totalRevenue: totalRevenue,
      newOrdersCount: newOrdersCount || 0,
      newCustomersThisMonth: newCustomersThisMonth,
      totalOverallCustomers: totalOverallCustomers,
      totalProducts: totalProducts || 0,
      totalArticles: totalArticles || 0,
    };
    console.log("API STATS: Final stats object:", stats);
    return NextResponse.json(stats);

  } catch (error: any) { // This outer catch is for truly unexpected errors like the "fetch failed"
    console.error('API STATS: Critical unhandled error in GET stats:', error.message, error.stack);
    // Include the original error message if it's the "fetch failed" type
    if (error.message && error.message.toLowerCase().includes("fetch failed")) {
        return NextResponse.json({ message: `Network error: Could not connect to database services. Details: ${error.message}` }, { status: 503 }); // 503 Service Unavailable
    }
    return NextResponse.json({ message: 'Failed to fetch dashboard statistics due to an unexpected server error.', error: error.message }, { status: 500 });
  }
}