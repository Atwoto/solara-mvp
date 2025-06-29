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


// src/app/api/admin/projects/route.ts

// ... (keep the GET handler and other imports as they are)

// --- FINAL POST Handler: Correctly handles thumbnail uploads ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as 'image' | 'video';
    const is_published = formData.get('is_published') === 'true';
    const display_order = parseInt(formData.get('display_order') as string, 10);
    
    const mediaFile = formData.get('mediaFile') as File | null;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    let media_url = formData.get('media_url') as string;
    let thumbnail_url: string | null = null;
    
    // Helper function for uploads
    const uploadFile = async (file: File) => {
        const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabaseAdmin.storage.from('project-media').upload(`public/${fileName}`, file);
        if (error) throw new Error(`Storage Error: ${error.message}`);
        return supabaseAdmin.storage.from('project-media').getPublicUrl(data.path).data.publicUrl;
    };

    if (type === 'image' && mediaFile) {
      media_url = await uploadFile(mediaFile);
    }

    // --- THIS IS THE FIX: Actually upload the thumbnail file ---
    if (thumbnailFile) {
      thumbnail_url = await uploadFile(thumbnailFile);
    }

    const newProjectData = { title, description, category, type, is_published, display_order, media_url, thumbnail_url };
    const { data: createdProject, error: insertError } = await supabaseAdmin.from('projects').insert([newProjectData]).select().single();
    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Project created successfully!', project: createdProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 });
  }
}