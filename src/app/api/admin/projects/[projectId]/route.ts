// src/app/api/admin/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media';

/**
 * @description GET handler to fetch a single project by its ID for the admin panel.
 * @param req The Next.js request object.
 * @param params Contains the dynamic route parameter, projectId.
 * @returns A JSON response with the project data or an error message.
 */
export async function GET(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) {
            // Handle case where no project is found
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }
            throw error;
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error fetching project ${projectId}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * @description PUT handler to update an existing project.
 * Handles form data including file uploads and the new 'highlights' JSON field.
 * @param req The Next.js request object containing the form data.
 * @param params Contains the dynamic route parameter, projectId.
 * @returns A JSON response with a success message and the updated project data, or an error.
 */
export async function PUT(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        const formData = await req.formData();
        
        // Build the base object with data to update
        const updateData: { [key: string]: any } = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            type: formData.get('type') as string,
            is_published: formData.get('is_published') === 'true',
            display_order: parseInt(formData.get('display_order') as string, 10),
            updated_at: new Date().toISOString(), // Always update the timestamp
        };

        // --- MODIFICATION START: Handle 'highlights' JSON data ---
        // Check if the 'highlightsJson' field exists in the form data
        if (formData.has('highlightsJson')) {
            const highlightsJson = formData.get('highlightsJson') as string;
            try {
                // Parse the JSON string and add it to the update object
                updateData.highlights = JSON.parse(highlightsJson);
            } catch (error) {
                console.error("Invalid JSON format for highlights:", highlightsJson);
                // Return a specific error if the JSON is malformed
                return NextResponse.json({ error: 'The format for highlights is invalid. Please provide a valid JSON array.' }, { status: 400 });
            }
        }
        // --- MODIFICATION END ---

        // Handle video URL, which is not a file upload
        if (updateData.type === 'video') {
            updateData.media_url = formData.get('media_url') as string;
        }

        const mediaFile = formData.get('mediaFile') as File | null;
        const thumbnailFile = formData.get('thumbnailFile') as File | null;

        // Helper function to upload a file to Supabase Storage
        const uploadFile = async (file: File | null) => {
            if (!file) return null;
            const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
            const { data, error } = await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).upload(`public/${fileName}`, file);
            if (error) throw new Error(`Storage Error: ${error.message}`);
            return supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl;
        };

        // Upload new media and thumbnail files if they exist
        const [mediaUploadUrl, thumbnailUploadUrl] = await Promise.all([
            uploadFile(mediaFile),
            uploadFile(thumbnailFile)
        ]);

        // If a new media file was uploaded, update the URL
        if (mediaUploadUrl) updateData.media_url = mediaUploadUrl;
        // If a new thumbnail file was uploaded, update the URL
        if (thumbnailUploadUrl) updateData.thumbnail_url = thumbnailUploadUrl;

        // Perform the update operation in the database
        const { data, error } = await supabaseAdmin
            .from('projects')
            .update(updateData)
            .eq('id', projectId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'Project updated successfully!', project: data });
    } catch (error: any) {
        console.error(`Error updating project ${projectId}:`, error);
        return NextResponse.json({ error: `Failed to update project: ${error.message}` }, { status: 500 });
    }
}

/**
 * @description DELETE handler to remove a project and its associated storage files.
 * @param req The Next.js request object.
 * @param params Contains the dynamic route parameter, projectId.
 * @returns A JSON response with a success or error message.
 */
export async function DELETE(req: NextRequest, { params }: { params: { projectId: string }}) {
    const { projectId } = params;
    try {
        // First, fetch the project to get its media and thumbnail URLs
        const { data: projectData, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('media_url, thumbnail_url, type')
            .eq('id', projectId)
            .single();

        if (fetchError) throw fetchError;

        // Delete the project record from the database
        const { error: deleteError } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (deleteError) throw deleteError;
        
        const filesToDelete: string[] = [];
        
        // Add media file to deletion list ONLY if it's an image project
        if (projectData.type === 'image' && projectData.media_url && projectData.media_url.includes(SUPABASE_PROJECTS_IMAGE_BUCKET)) {
            const mediaFileName = projectData.media_url.substring(projectData.media_url.lastIndexOf('/') + 1);
            filesToDelete.push(`public/${mediaFileName}`);
        }
        // Always add thumbnail to deletion list if it exists
        if (projectData.thumbnail_url) {
            const thumbnailFileName = projectData.thumbnail_url.substring(projectData.thumbnail_url.lastIndexOf('/') + 1);
            filesToDelete.push(`public/${thumbnailFileName}`);
        }
        
        // If there are files to delete, remove them from storage
        if (filesToDelete.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).remove(filesToDelete);
            if (storageError) {
                // Log the error but don't throw, as the DB record is already deleted
                console.error("Error deleting storage files, but project record was removed:", storageError);
            }
        }

        return NextResponse.json({ message: 'Project deleted successfully.' });
    } catch (error: any) {
        console.error(`Error deleting project ${projectId}:`, error);
        return NextResponse.json({ error: `Failed to delete project: ${error.message}` }, { status: 500 });
    }
}
