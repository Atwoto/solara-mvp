// src/app/api/admin/service-categories/flat/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// This API just returns the flat list of all defined service categories
export async function GET(req: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('service_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
