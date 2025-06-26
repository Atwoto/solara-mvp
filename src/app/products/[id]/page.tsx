import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

// --- Import YOUR Client Component for displaying the product ---
import ProductDetailClient from '@/components/ProductDetailClient';

// NO MORE 'export const dynamic'. It's not needed with this architecture.

interface ProductPageProps {
  params: { id: string };
}

// This is a standard async Server Component
export default async function ProductPage({ params }: ProductPageProps) {
  // 1. Fetch public product data
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (productError || !product) {
    notFound();
  }

  // 2. Check for a user session from NextAuth
  const session = await getServerSession(authOptions);

  // 3. If a user exists, check their wishlist status
  let initialIsWishlisted = false;
  if (session?.user?.id) {
    const { data: wishlistItem } = await supabaseAdmin
      .from('wishlist_items')
      .select('product_id')
      .match({ user_id: session.user.id, product_id: product.id })
      .single();
    if (wishlistItem) {
      initialIsWishlisted = true;
    }
  }

  // 4. Render the Client Component with all the data
  return (
    <ProductDetailClient 
      product={product} 
      initialIsWishlisted={initialIsWishlisted} 
    />
  );
}