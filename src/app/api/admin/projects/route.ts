// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media';

// --- GET Handler: Fetches all projects for the admin panel ---
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to fetch projects: ${error.message}` }, { status: 500 });
  }
}


// src/app/api/admin/proje

// --- FINAL CORRECTED POST Handler ---
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

    const mediaFile = formData.get('mediaFile') as File | null;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    
    let media_url = formData.get('media_url') as string;

    // Upload files and get their URLs
    const [mediaUploadUrl, thumbnailUploadUrl] = await Promise.all([
        uploadFile(mediaFile),
        uploadFile(thumbnailFile)
    ]);
    
    // If it's an image project, the mediaFile upload is the main media_url
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
      thumbnail_url: thumbnailUploadUrl, // Use the result from the thumbnail upload
    };

    const { data: createdProject, error: insertError } = await supabaseAdmin.from('projects').insert([newProjectData]).select().single();
    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Project created successfully!', project: createdProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 });
  }
}