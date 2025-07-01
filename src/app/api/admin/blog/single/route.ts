// src/app/api/admin/blog/single/route.ts
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ message: 'Article not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error fetching single article:', error.message);
        return NextResponse.json({ message: 'Failed to fetch article', error: error.message }, { status: 500 });
    }
}
