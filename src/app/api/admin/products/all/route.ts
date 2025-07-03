// /src/app/api/admin/products/all/route.ts 

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

// This GET handler fetches ALL products for the admin panel.
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    if (!supabaseAdmin) {
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('created_at', { ascending: false }); // Show newest created first

        if (error) throw error;

        return NextResponse.json(data || []);

    } catch (error: any) {
        console.error('Error fetching all products for admin:', error.message);
        return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }
}
