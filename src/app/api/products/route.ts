import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product as ProductType } from '@/types'; 

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const supabase = supabaseAdmin;

    // --- Logic for fetching specific products by ID (for wishlist, etc.) ---
    if (ids) {
        try {
            const idArray = ids.split(',');
            let query = supabase
                .from('products')
                .select('*')
                .in('id', idArray)
                .eq('is_archived', false);

            const { data, error } = await query;

            if (error) throw error;
            
            return NextResponse.json(data as ProductType[] || []);

        } catch (error: any) {
            console.error('Error fetching products by IDs:', error.message);
            return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
        }
    }

    // --- Logic for fetching products for catalog pages ---
    const categorySlug = searchParams.get('category');
    const limit = searchParams.get('limit'); // --- THE FIX: Read the 'limit' parameter ---

    try {
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_archived', false);

        if (categorySlug) {
            query = query.eq('category', categorySlug); 
        }

        // --- THE FIX: Apply the limit to the query if it exists ---
        if (limit) {
            const parsedLimit = parseInt(limit, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                query = query.limit(parsedLimit);
            }
        }

        // Default sorting
        query = query.order('name', { ascending: true });

        const { data, error } = await query;

        if (error) throw error; 

        return NextResponse.json(data as ProductType[] || []);

    } catch (error: any) {
        console.error('Error fetching catalog products:', error.message);
        return NextResponse.json({ message: `Failed to fetch products: ${error.message}` }, { status: 500 });
    }
}
