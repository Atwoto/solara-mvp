import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com'; 
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

// GET Handler remains the same - it correctly fetches all services
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('service_pages')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch services.', details: error.message }, { status: 500 });
  }
}

// --- UPGRADED POST Handler: Creates a new service with multiple images ---
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    
    // Extract all form data
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const content_html = formData.get('content_html') as string;
    const status = (formData.get('status') as ServicePageData['status']) || 'draft';
    const excerpt = formData.get('excerpt') as string | null;
    const featuresJson = formData.get('featuresJson') as string | null;
    // ... extract other fields as needed ...
    
    // --- UPGRADE: Get all uploaded image files ---
    const imageFiles = formData.getAll('imageFiles') as File[];

    if (!title || !slug || !content_html) {
      return NextResponse.json({ message: 'Title, Slug, and Content are required.' }, { status: 400 });
    }
    if (imageFiles.length === 0) {
        return NextResponse.json({ message: 'At least one image is required.' }, { status: 400 });
    }

    const { data: existingService, error: slugCheckError } = await supabaseAdmin
      .from('service_pages').select('slug').eq('slug', slug).maybeSingle();
    if (slugCheckError) throw slugCheckError;
    if (existingService) {
      return NextResponse.json({ message: `A service with the slug "${slug}" already exists.` }, { status: 409 });
    }

    // --- UPGRADE: Upload all images in parallel ---
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = `public/${fileName}`;
            return supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).upload(filePath, file);
        });
        const uploadResults = await Promise.all(uploadPromises);

        for (const result of uploadResults) {
            if (result.error) throw new Error(`Image upload failed: ${result.error.message}`);
        }
        
        imageUrls = uploadResults.map(result => 
            supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(result.data!.path).data.publicUrl
        );
    }

    const newServiceData = {
      title,
      slug,
      content_html,
      status,
      excerpt,
      features: featuresJson ? JSON.parse(featuresJson) : [],
      // --- UPGRADE: Use the new database column name and save the array ---
      image_urls: imageUrls, 
      // ... add other fields from formData here if they exist ...
    };
    
    const { data: createdService, error: insertError } = await supabaseAdmin
      .from('service_pages')
      .insert(newServiceData)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Service created successfully!', service: createdService }, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating service:', error);
    return NextResponse.json({ message: `Failed to create service: ${error.message}` }, { status: 500 });
  }
}