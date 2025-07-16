// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media';

// --- GET Handler: Fetches all projects for the admin panel (No changes needed) ---
export async function GET() {
  // ... (existing code is correct)
}

// --- POST Handler: MODIFIED to include Highlights ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Helper function for uploads
    const uploadFile = async (file: File | null): Promise<string | null> => {
      if (!file) return null; //
      const fileName = `${uuidv4()}.${file.name.split('.').pop()}`; //
      const { data, error } = await supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).upload(`public/${fileName}`, file); //
      if (error) throw new Error(`Storage Error: ${error.message}`); //
      return supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl; //
    };

    // --- 1. GET AND PARSE HIGHLIGHTS JSON ---
    const highlightsJson = formData.get('highlightsJson') as string | null;
    let highlights = []; // Default to an empty array

    if (highlightsJson) {
        try {
            highlights = JSON.parse(highlightsJson);
        } catch (error) {
            console.error("Invalid JSON for highlights:", highlightsJson);
            // Return a specific error message if JSON is malformed
            return NextResponse.json({ error: 'The format for highlights is invalid. Please provide a valid JSON array.' }, { status: 400 });
        }
    }
    // --- END OF NEW CODE ---

    const mediaFile = formData.get('mediaFile') as File | null; //
    const thumbnailFile = formData.get('thumbnailFile') as File | null; //
    
    let media_url = formData.get('media_url') as string; //

    // Upload files and get their URLs
    const [mediaUploadUrl, thumbnailUploadUrl] = await Promise.all([ //
        uploadFile(mediaFile), //
        uploadFile(thumbnailFile) //
    ]);
    
    if (mediaUploadUrl) { //
      media_url = mediaUploadUrl; //
    }

    // --- 2. ADD HIGHLIGHTS TO THE PROJECT DATA ---
    const newProjectData = {
      title: formData.get('title') as string, //
      description: formData.get('description') as string, //
      category: formData.get('category') as string, //
      type: formData.get('type') as 'image' | 'video', //
      is_published: formData.get('is_published') === 'true', //
      display_order: parseInt(formData.get('display_order') as string, 10), //
      media_url: media_url, //
      thumbnail_url: thumbnailUploadUrl, //
      highlights, // Added the parsed highlights array here
    };
    // --- END OF CHANGES ---

    const { data: createdProject, error: insertError } = await supabaseAdmin.from('projects').insert([newProjectData]).select().single(); //
    if (insertError) throw insertError; //

    return NextResponse.json({ message: 'Project created successfully!', project: createdProject }, { status: 201 }); //
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 }); //
  }
}