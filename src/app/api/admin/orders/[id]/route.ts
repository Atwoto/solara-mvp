// /src/app/api/admin/orders/[id]/route.ts

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  try {
    const orderId = params.id;

    // Fetch the specific order with all related data
    const { data: order, error } = await supabaseAdmin
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
            wattage,
            description
          )
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Supabase error fetching order:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      throw error;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
