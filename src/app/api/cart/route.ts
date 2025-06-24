// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

// Helper to create a user-specific Supabase client
const createSupabaseClientForUser = (session: Session) => {
  const accessToken = (session as any).supabaseAccessToken;
  if (!accessToken) throw new Error("User is not authenticated with Supabase.");
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
};

// --- GET User's Cart ---
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // THE FIX: The check for `supabaseAdmin` is removed. The session check is sufficient.
  if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseClientForUser(session);
    
    // This query now relies on RLS (Row Level Security) being enabled in your Supabase dashboard
    // to ensure users can only access their own cart.
    const { data, error } = await supabase
      .from('cart')
      .select(`id, cart_items (product_id, quantity, products (*))`)
      .single();

    if (error && error.code !== 'PGRST116') { // 'PGRST116' means no cart found, which is okay.
      throw error;
    }
    
    // If no cart exists, create one.
    if (!data) {
      const { data: newCart, error: createError } = await supabase.from('cart').insert({}).select().single();
      if (createError) throw createError;
      return NextResponse.json([]); // Return empty cart for the new user.
    }

    const cartItems = data.cart_items.map(item => ({...item.products, quantity: item.quantity}));
    return NextResponse.json(cartItems);

  } catch (error: any) {
    console.error("GET /api/cart Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch cart.", details: error.message }, { status: 500 });
  }
}

// POST, PUT, DELETE operations would be similarly refactored to use `createSupabaseClientForUser`
// It is crucial that any future modifications to this file follow this pattern.



// --- POST (Add Item to Cart / Update Quantity) ---
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized: User not authenticated." }, { status: 401 });
        }
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { productId, quantity = 1 } = await req.json();
        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
             return NextResponse.json({ error: "Invalid product ID or quantity provided." }, { status: 400 });
        }

        const cartResult = await getOrCreateCart(session.user.id);
        // FIX: Check if cartResult is null
        if (!cartResult) {
            return NextResponse.json({ error: "Could not retrieve or create cart." }, { status: 500 });
        }
        const { id: cartId } = cartResult; // This is now safe

        const { data: existingItem, error: findError } = await supabaseAdmin
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .single<{ id: string; quantity: number }>();

        if (findError && findError.code !== 'PGRST116') { throw findError; }

        let upsertedItemData: SupabaseCartItemWithProduct | null = null;

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            const { data, error } = await supabaseAdmin.from('cart_items').update({ quantity: newQuantity })
                .eq('id', existingItem.id)
                .select(`product_id, quantity, products (*)`).single<SupabaseCartItemWithProduct>();
            if (error) throw error;
            upsertedItemData = data;
        } else {
            const { data, error } = await supabaseAdmin.from('cart_items')
                .insert({ cart_id: cartId, product_id: productId, quantity: quantity })
                .select(`product_id, quantity, products (*)`).single<SupabaseCartItemWithProduct>();
            if (error) throw error;
            upsertedItemData = data;
        }
        
        if (!upsertedItemData || !upsertedItemData.products) {
            throw new Error("Failed to upsert cart item or retrieve product details.");
        }
        const cartItem: AppCartItemType = {
            ...(upsertedItemData.products as AppProductType),
            quantity: upsertedItemData.quantity,
        };
        return NextResponse.json({ message: "Item processed in cart successfully", item: cartItem }, { status: 200 });

    } catch (error: any) {
        console.error("Error in POST /api/cart:", error);
        return NextResponse.json({ error: "Failed to process item in cart.", details: error.message }, { status: 500 });
    }
}

// --- DELETE (Clear Cart) ---
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // --- THE FIX IS ON THE LINE BELOW ---
        const { data: cart, error: cartError } = await supabaseAdmin
            .from('cart')
            .select('id')
            .eq('user_id', session.user.id)
            .single<{ id: string }>(); // <-- Add the type hint here

        if (cartError && cartError.code !== 'PGRST116') {
             throw cartError;
        }

        if (cart) {
            // Now TypeScript knows `cart` is of type `{ id: string } | null`.
            // Inside this 'if' block, it knows `cart.id` is a string.
            const { error: deleteItemsError } = await supabaseAdmin
                .from('cart_items')
                .delete()
                .eq('cart_id', cart.id); // This is now perfectly type-safe!
            
            if (deleteItemsError) {
                console.error("Error deleting cart items:", deleteItemsError);
                throw deleteItemsError;
            }
        }
        
        return NextResponse.json({ message: "Cart cleared successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Error in DELETE /api/cart:", error);
        return NextResponse.json({ error: "Failed to clear cart.", details: error.message }, { status: 500 });
    }
}