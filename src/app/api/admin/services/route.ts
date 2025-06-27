// /src/app/api/admin/services/route.ts -- FINAL CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com'; 
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

// --- GET Handler: Fetches all services for the admin panel ---
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('service_pages')
      .select('*')
      // --- THIS IS THE FIX ---
      .order('display_order', { ascending: true, nullsFirst: false }) // Puts null display_order values at the end
      .order('created_at', { ascending: false }); // Then sorts by newest

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch services.', details: error.message }, { status: 500 });
  }
}

// --- POST Handler: Creates a new service ---
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const content_html = formData.get('content_html') as string;
    const imageFile = formData.get('imageFile') as File | null;
    const status = (formData.get('status') as ServicePageData['status']) || 'draft';
    const excerpt = formData.get('excerpt') as string | null;

    if (!title || !slug || !content_html) {
      return NextResponse.json({ message: 'Title, Slug, and Content are required.' }, { status: 400 });
    }

    const { data: existingService, error: slugCheckError } = await supabaseAdmin
      .from('service_pages')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;
    if (existingService) {
      return NextResponse.json({ message: `A service with the slug "${slug}" already exists.` }, { status: 409 });
    }

    let imageUrl: string | null = null;
    
    if (imageFile) {
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `public/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(SUPABASE_SERVICES_IMAGE_BUCKET)
        .upload(filePath, imageFile);
        
      if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
      
      imageUrl = supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
    }

    const newService = {
      title,
      slug,
      content_html,
      hero_image_url: imageUrl,
      status,
      excerpt,
    };
    
    const { data: createdService, error: insertError } = await supabaseAdmin
      .from('service_pages')
      .insert(newService)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Service created successfully!', service: createdService }, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service.', details: error.message }, { status: 500 });
  }
}