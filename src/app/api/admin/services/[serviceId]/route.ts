// src/app/api/admin/services/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

interface RouteParams {
  params: { serviceId: string };
}

// GET Handler remains the same
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { data, error } = await supabaseAdmin.from('service_pages').select('*').eq('id', serviceId).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ message: 'Service not found' }, { status: 404 });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', details: error.message }, { status: 500 });
  }
}

// CORRECTED PUT Handler
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const formData = await request.formData();
    
    // --- FIX: Get each field directly from formData ---
    const dataToUpdate: { [key: string]: any } = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        content_html: formData.get('content_html') as string,
        status: formData.get('status') as string,
        parent_service_slug: formData.get('parent_service_slug') as string || null,
        excerpt: formData.get('excerpt') as string || null,
        icon_svg: formData.get('icon_svg') as string || null,
        meta_title: formData.get('meta_title') as string || null,
        meta_description: formData.get('meta_description') as string || null,
        features: JSON.parse(formData.get('featuresJson') as string || '[]'),
        call_to_action_label: formData.get('call_to_action_label') as string,
        call_to_action_link: formData.get('call_to_action_link') as string,
        display_order: Number(formData.get('display_order') as string),
        updated_at: new Date().toISOString(),
    };

    const imageFiles = formData.getAll('imageFiles') as File[];
    const currentImageUrls = formData.getAll('currentImageUrls') as string[];
    let newImageUrls: string[] = [];

    if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => {
            const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
            return supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).upload(`public/${fileName}`, file);
        });
        const uploadResults = await Promise.all(uploadPromises);
        for(const result of uploadResults) {
            if(result.error) throw new Error(`Image upload failed: ${result.error.message}`);
        }
        newImageUrls = uploadResults.map(result => 
            supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(result.data!.path).data.publicUrl
        );
    }
    
    dataToUpdate.image_urls = [...currentImageUrls, ...newImageUrls];
    
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('service_pages')
      .update(dataToUpdate)
      .eq('id', serviceId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Service updated successfully!', service: updatedData });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to update service: ${error.message}` }, { status: 500 });
  }
}

// CORRECTED DELETE Handler
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { data: serviceToDelete, error: fetchErr } = await supabaseAdmin
      .from('service_pages')
      .select('image_urls')
      .eq('id', serviceId)
      .single();
    if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

    const { error: deleteError } = await supabaseAdmin
      .from('service_pages')
      .delete()
      .eq('id', serviceId);
    if (deleteError) throw deleteError;

    if (serviceToDelete?.image_urls && serviceToDelete.image_urls.length > 0) {
      // --- FIX: Explicitly type 'url' as a string ---
      const fileNames = serviceToDelete.image_urls.map((url: string) => `public/${url.split('/').pop()}`);
      
      const { error: storageError } = await supabaseAdmin.storage
        .from(SUPABASE_SERVICES_IMAGE_BUCKET)
        .remove(fileNames);
        
      if (storageError) {
        console.warn(`DB record deleted, but failed to delete images: ${storageError.message}`);
      }
    }
    
    return NextResponse.json({ message: 'Service deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to delete service: ${error.message}` }, { status: 500 });
  }
}