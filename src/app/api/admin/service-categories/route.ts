// src/app/api/admin/service-categories/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Helper function to verify admin
async function isAdmin(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user.email === ADMIN_EMAIL;
}

// Function to CREATE or UPDATE a category
export async function POST(req: NextRequest) {
    if (!await isAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const categoryData = await req.json();
        
        // Basic validation
        if (!categoryData.name || !categoryData.slug) {
            return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
        }

        // Use the admin client to perform the database operation
        const { data, error } = await supabaseAdmin
            .from('service_categories')
            .upsert(categoryData) // upsert will create or update based on primary key
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Function to DELETE a category
export async function DELETE(req: NextRequest) {
    if (!await isAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
        }

        // Deleting a parent will cascade and delete its children due to the DB schema
        const { error } = await supabaseAdmin
            .from('service_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Category deleted successfully.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
