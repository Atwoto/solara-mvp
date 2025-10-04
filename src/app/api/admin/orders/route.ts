// /src/app/api/admin/orders/route.ts -- FINAL CORRECTED VERSION

import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// Create the admin client directly in the file
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "kenbillsonsolararea@gmail.com";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  try {
    // Enhanced query to include product details for admin CRM
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        users ( email ),
        order_items (
          product_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            price,
            image_url,
            category,
            wattage
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching orders:", error);
      throw error;
    }

    // Now, your orders will have a 'users' object with the email inside
    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
