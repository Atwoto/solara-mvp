// src/app/api/admin/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
// Your auth imports here

// --- GET Handler: Fetch a single project for the edit page ---
export async function GET(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    // Add auth checks
    try {
        const { data, error } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- PUT Handler: Update an existing project ---
export async function PUT(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    // Add auth checks
    try {
        // This logic will be almost identical to the POST handler,
        // but it will use .update().eq('id', projectId) instead of .insert()
        // We'll leave this as a placeholder for now to get the edit page working.
        
        // You would get formData, handle file uploads, then update.
        // For now, just a success message:
        return NextResponse.json({ message: 'Project updated successfully!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- DELETE Handler: Delete a project ---
export async function DELETE(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    // Add auth checks
    try {
        // You'll want to delete the images from storage first, then the DB record.
        const { error } = await supabaseAdmin.from('projects').delete().eq('id', projectId);
        if (error) throw error;
        return NextResponse.json({ message: 'Project deleted successfully.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}