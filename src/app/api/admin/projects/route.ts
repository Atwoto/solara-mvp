// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
// Make sure to implement your auth check as needed
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';

const SUPABASE_PROJECTS_IMAGE_BUCKET = 'project-media'; // Using a dedicated bucket

// Helper function to upload a file to Supabase Storage
async function uploadFile(file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_PROJECTS_IMAGE_BUCKET)
      .upload(filePath, file);
      
    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return supabaseAdmin.storage.from(SUPABASE_PROJECTS_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl;
}


// --- POST Handler: Creates a new project ---
export async function POST(request: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.email) { // Add your admin email check here
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  // }

  try {
    const formData = await request.formData();
    
    // --- Get all data from the form ---
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as 'image' | 'video';
    const is_published = formData.get('is_published') === 'true';
    const display_order = parseInt(formData.get('display_order') as string, 10);
    
    const mediaFile = formData.get('mediaFile') as File | null;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    let media_url = formData.get('media_url') as string; // For video URLs
    let thumbnail_url: string | null = null;
    
    // --- Validation ---
    if (!title || !category) {
        return NextResponse.json({ error: 'Title and Category are required.' }, { status: 400 });
    }
    if (type === 'image' && !mediaFile) {
        return NextResponse.json({ error: 'An image file is required for projects of type "Image".' }, { status: 400 });
    }
    if (type === 'video' && !media_url) {
        return NextResponse.json({ error: 'A YouTube Embed URL is required for projects of type "Video".' }, { status: 400 });
    }

    // --- File Handling ---
    // Upload the main media file if it's an image project
    if (type === 'image' && mediaFile) {
      media_url = await uploadFile(mediaFile);
    }
    // Upload the thumbnail file if it exists
    if (thumbnailFile) {
      thumbnail_url = await uploadFile(thumbnailFile);
    }

    // --- Prepare data for insertion ---
    const newProjectData = {
      title,
      description,
      category,
      type,
      is_published,
      display_order,
      media_url,
      thumbnail_url,
    };

    // --- Insert into the database ---
    const { data: createdProject, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert([newProjectData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase DB Insert Error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ message: 'Project created successfully!', project: createdProject }, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating project:', error);
    return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 });
  }
}