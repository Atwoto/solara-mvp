// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media';

/**
 * --- THIS IS THE FIX ---
 * GET Handler: Fetches all projects for the admin panel.
 */
export async function GET() {
  try {
    // Check if the Supabase client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    // Query the 'projects' table for all records
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*') // Select all columns
      .order('created_at', { ascending: false }); // Order by newest first

    // If there's an error during the fetch, throw it to be caught by the catch block
    if (error) {
      throw error;
    }

    // If successful, return the projects data with a 200 OK status
    return NextResponse.json(projects, { status: 200 });

  } catch (error: any) {
    // Log the error for debugging purposes on the server
    console.error('API Error fetching projects:', error);
    // Return a JSON response with a clear error message and a 500 status code
    return NextResponse.json({ message: 'Failed to fetch projects', error: error.message }, { status: 500 });
  }
}

// --- POST Handler: This part is correct and remains unchanged ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Helper function for uploads
    const uploadFile = async (file: File | null): Promise<string | null> => {
      if (!file) return null;
      const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).upload(`public/${fileName}`, file);
      if (error) throw new Error(`Storage Error: ${error.message}`);
      return supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl;
    };

    // GET AND PARSE HIGHLIGHTS JSON
    const highlightsJson = formData.get('highlightsJson') as string | null;
    let highlights = [];

    if (highlightsJson) {
        try {
            highlights = JSON.parse(highlightsJson);
        } catch (error) {
            console.error("Invalid JSON for highlights:", highlightsJson);
            return NextResponse.json({ error: 'The format for highlights is invalid. Please provide a valid JSON array.' }, { status: 400 });
        }
    }

    const mediaFile = formData.get('mediaFile') as File | null;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    let media_url = formData.get('media_url') as string;

    const [mediaUploadUrl, thumbnailUploadUrl] = await Promise.all([
        uploadFile(mediaFile),
        uploadFile(thumbnailFile)
    ]);
    
    if (mediaUploadUrl) {
      media_url = mediaUploadUrl;
    }

    const newProjectData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      type: formData.get('type') as 'image' | 'video',
      is_published: formData.get('is_published') === 'true',
      display_order: parseInt(formData.get('display_order') as string, 10),
      media_url: media_url,
      thumbnail_url: thumbnailUploadUrl,
      highlights,
    };

    const { data: createdProject, error: insertError } = await supabaseAdmin.from('projects').insert([newProjectData]).select().single();
    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Project created successfully!', project: createdProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 });
  }
}
