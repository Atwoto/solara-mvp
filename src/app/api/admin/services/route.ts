// src/app/api/admin/services/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

interface RouteParams {
  params: {
    serviceId: string;
  };
}

// Type guard function for better type safety
function isServicePageData(data: any): data is ServicePageData {
  return data && 
         typeof data.id === 'string' &&
         typeof data.title === 'string' &&
         typeof data.slug === 'string' &&
         typeof data.content_html === 'string';
}

// --- GET Handler: Fetch a single service by ID ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  console.log(`API: GET /api/admin/services/${serviceId} hit`);

  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  if (!serviceId) {
    return NextResponse.json({ message: 'Service ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('service_pages')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ message: 'Service not found' }, { status: 404 });
      }
      console.error('API: Supabase error fetching service by ID:', JSON.stringify(error, null, 2));
      return NextResponse.json({ message: 'Database error fetching service', error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // FIX: Use a two-step cast to 'unknown' first to resolve the TypeScript error.
    return NextResponse.json(data as unknown as ServicePageData);
  } catch (error: any) {
    console.error('API: Unhandled error fetching service by ID:', error.message, error.stack);
    return NextResponse.json({ message: 'Unexpected server error', error: error.message }, { status: 500 });
  }
}

// --- PUT Handler: Update an existing service ---
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  console.log(`API: PUT /api/admin/services/${serviceId} hit`);

  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  
  if (!serviceId) {
    return NextResponse.json({ message: 'Service ID is required for update' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string | null;
    const slug = formData.get('slug') as string | null;
    const content_html = formData.get('content_html') as string | null;
    const status = (formData.get('status') as ServicePageData['status'] | null);
    const parent_service_slug_from_form = formData.get('parent_service_slug') as string | null;
    const excerpt = formData.get('excerpt') as string | null;
    const icon_svg = formData.get('icon_svg') as string | null;
    const meta_title = formData.get('meta_title') as string | null;
    const meta_description = formData.get('meta_description') as string | null;
    const featuresJsonString = formData.get('featuresJson') as string | null;
    const call_to_action_label = formData.get('call_to_action_label') as string | null;
    const call_to_action_link = formData.get('call_to_action_link') as string | null;
    const display_order_string = formData.get('display_order') as string | null;
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null;

    if (!title || !slug || !content_html) {
      return NextResponse.json({ message: 'Missing required fields: title, slug, and content_html are required.' }, { status: 400 });
    }
    
    let features = null;
    if (featuresJsonString) {
      try {
        features = JSON.parse(featuresJsonString);
      } catch (e) {
        return NextResponse.json({ message: 'Invalid JSON format for features.' }, { status: 400 });
      }
    }

    if (slug) {
      const { data: existingSlug, error: slugCheckError } = await supabaseAdmin
        .from('service_pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', serviceId)
        .maybeSingle();
        
      if (slugCheckError) {
        console.error('API: Error checking slug uniqueness:', JSON.stringify(slugCheckError, null, 2));
        return NextResponse.json({ message: 'Database error checking slug uniqueness', error: slugCheckError.message }, { status: 500 });
      }
      
      if (existingSlug) {
        return NextResponse.json({ message: `Slug "${slug}" is already in use by another service.` }, { status: 409 });
      }
    }

    let newHeroImageUrl: string | undefined | null = currentImageUrl || null;
    
    if (imageFile) {
      if (currentImageUrl) {
        try {
          const oldFileName = currentImageUrl.split('/').pop();
          if (oldFileName) {
            await supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).remove([`public/${oldFileName}`]);
            console.log("API: Deleted old image:", currentImageUrl);
          }
        } catch (e) {
          console.error("API: Failed to delete old image, continuing update:", e);
        }
      }
      
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `public/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(SUPABASE_SERVICES_IMAGE_BUCKET)
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type });
        
      if (uploadError) {
        console.error('API: Supabase storage upload error:', JSON.stringify(uploadError, null, 2));
        return NextResponse.json({ message: 'Failed to upload new service image.', error: uploadError.message }, { status: 500 });
      }
      
      newHeroImageUrl = supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
    } else if (imageFile === null && formData.has('currentImageUrl') && !currentImageUrl) {
      newHeroImageUrl = null;
    }

    const dataToUpdate: Partial<ServicePageData> = {};
    if (title) dataToUpdate.title = title;
    if (slug) dataToUpdate.slug = slug;
    if (content_html) dataToUpdate.content_html = content_html;
    if (status) dataToUpdate.status = status;
    dataToUpdate.parent_service_slug = parent_service_slug_from_form && parent_service_slug_from_form.trim() !== '' ? parent_service_slug_from_form.trim() : null;
    if (excerpt !== null) dataToUpdate.excerpt = excerpt;
    if (newHeroImageUrl !== undefined) dataToUpdate.hero_image_url = newHeroImageUrl;
    if (icon_svg !== null) dataToUpdate.icon_svg = icon_svg;
    if (meta_title !== null) dataToUpdate.meta_title = meta_title;
    if (meta_description !== null) dataToUpdate.meta_description = meta_description;
    if (features !== null) dataToUpdate.features = features;
    if (call_to_action_label !== null) dataToUpdate.call_to_action_label = call_to_action_label;
    if (call_to_action_link !== null) dataToUpdate.call_to_action_link = call_to_action_link;
    if (display_order_string !== null) dataToUpdate.display_order = Number(display_order_string);
    dataToUpdate.updated_at = new Date().toISOString();

    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('service_pages')
      .update(dataToUpdate)
      .eq('id', serviceId)
      .select()
      .single();

    if (updateError) {
      console.error('API: Supabase error updating service:', JSON.stringify(updateError, null, 2));
      return NextResponse.json({ message: 'Failed to update service.', error: updateError.message, details: updateError.details }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service updated successfully!', service: updatedData });
  } catch (error: any) {
    console.error('API: Unhandled error updating service:', error.message, error.stack);
    return NextResponse.json({ message: 'Unexpected server error during service update.', error: error.message }, { status: 500 });
  }
}

// --- DELETE Handler: Delete a service by ID ---
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { serviceId } = params;
  console.log(`API: DELETE /api/admin/services/${serviceId} hit`);

  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  
  if (!serviceId) {
    return NextResponse.json({ message: 'Service ID is required for deletion' }, { status: 400 });
  }

  try {
    const { data: serviceToDelete, error: fetchErr } = await supabaseAdmin
      .from('service_pages')
      .select('hero_image_url')
      .eq('id', serviceId)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('API: Error fetching service for deletion:', JSON.stringify(fetchErr, null, 2));
      return NextResponse.json({ message: 'Database error', error: fetchErr.message }, { status: 500 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('service_pages')
      .delete()
      .eq('id', serviceId);

    if (deleteError) {
      console.error('API: Supabase error deleting service record:', JSON.stringify(deleteError, null, 2));
      return NextResponse.json({ message: 'Failed to delete service record.', error: deleteError.message }, { status: 500 });
    }

    // FIX: Use explicit typeof check to ensure hero_image_url is a string before calling .split().
    if (serviceToDelete && typeof serviceToDelete.hero_image_url === 'string') {
      try {
        const fileName = serviceToDelete.hero_image_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabaseAdmin.storage
            .from(SUPABASE_SERVICES_IMAGE_BUCKET)
            .remove([`public/${fileName}`]);
            
          if (storageError) {
            console.warn('API: Failed to delete image from storage, but DB record deleted:', JSON.stringify(storageError, null, 2));
          } else {
            console.log("API: Successfully deleted image from storage:", serviceToDelete.hero_image_url);
          }
        }
      } catch (e) {
        console.warn('API: Error during image deletion from storage:', e);
      }
    }
    
    return NextResponse.json({ message: 'Service deleted successfully.' });
  } catch (error: any) {
    console.error('API: Unhandled error deleting service:', error.message, error.stack);
    return NextResponse.json({ message: 'Unexpected server error during deletion.', error: error.message }, { status: 500 });
  }
}