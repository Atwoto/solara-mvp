// src/app/api/admin/blog/all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { BlogPost } from '@/types';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

export async function GET(req: NextRequest) {
    // --- THE FIX: Added admin authentication check ---
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    if (!supabaseAdmin) {
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data || []);

    } catch (error: any) {
        console.error('Error fetching all articles for admin:', error.message);
        return NextResponse.json({ message: 'Failed to fetch articles', error: error.message }, { status: 500 });
    }
}
