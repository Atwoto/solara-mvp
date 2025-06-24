// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const createSupabaseClientForUser = (session: Session) => {
  const accessToken = (session as any).supabaseAccessToken;
  if (!accessToken) throw new Error("User is not authenticated with Supabase.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { data, error } = await supabase.from('wishlist_items').select('product_id');
    if (error) throw error;
    const wishlistIds = data.map(item => item.product_id);
    return NextResponse.json(wishlistIds || []); 
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    await supabase.from('wishlist_items').upsert({ user_id: session.user.id, product_id: productId }, { onConflict: 'user_id, product_id' });
    return NextResponse.json({ success: true, message: "Item added to wishlist." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const supabase = createSupabaseClientForUser(session);
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    await supabase.from('wishlist_items').delete().match({ user_id: session.user.id, product_id: productId });
    return NextResponse.json({ success: true, message: "Item removed from wishlist." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}