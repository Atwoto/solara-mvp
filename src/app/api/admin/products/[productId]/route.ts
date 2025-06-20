// Add this type guard function before your route handlers
function isProduct(data: any): data is Product {
  return data && 
         typeof data.id === 'string' &&
         typeof data.name === 'string' &&
         typeof data.price === 'number' &&
         typeof data.category === 'string';
}

// Updated GET Handler
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      console.error('API: Supabase error GET product:', JSON.stringify(error, null, 2));
      return NextResponse.json({ message: 'Database error', error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    
    // Use type guard or type assertion
    if (isProduct(data)) {
      return NextResponse.json(data);
    } else {
      // Fallback: use type assertion
      return NextResponse.json(data as unknown as Product);
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}