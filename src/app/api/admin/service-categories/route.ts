// src/app/api/admin/service-categories/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache'; // <-- Import the revalidation function

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
        
        if (!categoryData.name || !categoryData.slug) {
            return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('service_categories')
            .upsert(categoryData)
            .select()
            .single();

        if (error) throw error;

        // --- THIS IS THE FIX ---
        // After successfully saving, revalidate the necessary pages.
        revalidatePath('/'); // Revalidates the layout, which includes the header menu.
        revalidatePath('/admin/services'); // Revalidates the admin services page.

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

        const { error } = await supabaseAdmin
            .from('service_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // --- THIS IS THE FIX ---
        // After successfully deleting, revalidate the necessary pages.
        revalidatePath('/'); // Revalidates the layout, which includes the header menu.
        revalidatePath('/admin/services'); // Revalidates the admin services page.

        return NextResponse.json({ message: 'Category deleted successfully.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
