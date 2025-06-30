// src/app/api/admin/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media';

// --- GET Handler ---
export async function GET(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        const { data, error } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single();
        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            throw error;
        }
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- FINAL CORRECTED PUT Handler ---
export async function PUT(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        const formData = await req.formData();
        
        // Build the update object by getting each field directly
        const updateData: { [key: string]: any } = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            type: formData.get('type') as string,
            is_published: formData.get('is_published') === 'true',
            display_order: parseInt(formData.get('display_order') as string, 10),
            updated_at: new Date().toISOString(), // Good practice to add this
        };

        // Handle video URL separately, as it might not be a file
        if (updateData.type === 'video') {
            updateData.media_url = formData.get('media_url') as string;
        }

        const mediaFile = formData.get('mediaFile') as File | null;
        const thumbnailFile = formData.get('thumbnailFile') as File | null;

        const uploadFile = async (file: File | null) => {
            if (!file) return null;
            const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
            const { data, error } = await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).upload(`public/${fileName}`, file);
            if (error) throw new Error(`Storage Error: ${error.message}`);
            return supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl;
        };

        const [mediaUploadUrl, thumbnailUploadUrl] = await Promise.all([
            uploadFile(mediaFile),
            uploadFile(thumbnailFile)
        ]);

        if (mediaUploadUrl) updateData.media_url = mediaUploadUrl;
        if (thumbnailUploadUrl) updateData.thumbnail_url = thumbnailUploadUrl;

        const { data, error } = await supabaseAdmin.from('projects').update(updateData).eq('id', projectId).select().single();
        if (error) throw error;

        return NextResponse.json({ message: 'Project updated successfully!', project: data });
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to update project: ${error.message}` }, { status: 500 });
    }
}

// --- FINAL CORRECTED DELETE Handler ---
export async function DELETE(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        const { data: projectData, error: fetchError } = await supabaseAdmin.from('projects').select('media_url, thumbnail_url').eq('id', projectId).single();
        if (fetchError) throw fetchError;

        const { error: deleteError } = await supabaseAdmin.from('projects').delete().eq('id', projectId);
        if (deleteError) throw deleteError;
        
        const filesToDelete: string[] = [];
        // Check if the URL is a Supabase storage URL before trying to delete
        if (projectData.media_url && projectData.media_url.includes(SUPABASE_PROJECTS_IMAGE_BUCKET)) {
            filesToDelete.push(projectData.media_url.split('/').pop()!);
        }
        if (projectData.thumbnail_url) {
            filesToDelete.push(projectData.thumbnail_url.split('/').pop()!);
        }
        
        if (filesToDelete.length > 0) {
            // Prepend 'public/' to each filename for correct pathing
            await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).remove(filesToDelete.map(f => `public/${f}`));
        }

        return NextResponse.json({ message: 'Project deleted successfully.' });
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to delete project: ${error.message}` }, { status: 500 });
    }
}