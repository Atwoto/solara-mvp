// src/app/api/admin/services/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient'; // Use admin client for all ops here
import { ServicePageData } from '@/types';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

interface RouteParams {
  params: {
    serviceId: string;
  };
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
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Service not found' }, { status: 404 });
      }
      console.error('API: Supabase error fetching service by ID:', JSON.stringify(error, null, 2));
      return NextResponse.json({ message: 'Database error fetching service', error: error.message }, { status: 500 });
    }

    if (!data) { // Should be caught by PGRST116, but as a fallback
        return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(data as ServicePageData);
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
    // ... (Extract all fields from formData similar to POST: title, slug, content_html, etc.)
    const title = formData.get('title') as string | null;
    const slug = formData.get('slug') as string | null; // Consider if slug should be updatable
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
    const currentImageUrl = formData.get('currentImageUrl') as string | null; // Sent by form if image not changed

    if (!title || !slug || !content_html) { /* ... return 400 ... */ }
    
    let features = null;
    if (featuresJsonString) { try { features = JSON.parse(featuresJsonString); } catch (e) { /* ... return 400 ... */ } }

    // Optional: Check if new slug conflicts with another existing service (excluding current serviceId)
    if (slug) {
        const { data: existingSlug, error: slugCheckError } = await supabaseAdmin
            .from('service_pages').select('id').eq('slug', slug).neq('id', serviceId).maybeSingle();
        if (slugCheckError) { /* handle error */ }
        if (existingSlug) { return NextResponse.json({ message: `Slug "${slug}" is already in use by another service.` }, { status: 409 }); }
    }

    let newHeroImageUrl: string | undefined | null = currentImageUrl || null; // Keep current if no new file
    if (imageFile) {
        // 1. Delete old image if it exists and is different (optional, or handle orphaned files periodically)
        if (currentImageUrl) {
            try {
                const oldFileName = currentImageUrl.split('/').pop();
                if (oldFileName) {
                    await supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).remove([`public/${oldFileName}`]);
                    console.log("API: Deleted old image:", currentImageUrl);
                }
            } catch (e) { console.error("API: Failed to delete old image, continuing update:", e); }
        }
        // 2. Upload new image
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(SUPABASE_SERVICES_IMAGE_BUCKET).upload(`public/${fileName}`, imageFile, { /* ... options ... */ });
        if (uploadError) { /* ... return 500 ... */ }
        newHeroImageUrl = supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
    }

    const dataToUpdate: Partial<ServicePageData> = {};
    if (title) dataToUpdate.title = title;
    if (slug) dataToUpdate.slug = slug; // Only if you allow slug updates
    if (content_html) dataToUpdate.content_html = content_html;
    if (status) dataToUpdate.status = status;
    dataToUpdate.parent_service_slug = parent_service_slug_from_form && parent_service_slug_from_form.trim() !== '' ? parent_service_slug_from_form.trim() : null;
    if (excerpt) dataToUpdate.excerpt = excerpt;
    if (newHeroImageUrl !== undefined) dataToUpdate.hero_image_url = newHeroImageUrl; // Update if new image uploaded or explicitly cleared
    else if (imageFile === null && formData.has('currentImageUrl') && !currentImageUrl) { // Check if image was intentionally cleared
        dataToUpdate.hero_image_url = null;
    }
    // ... (conditionally add other fields to dataToUpdate if they were provided in formData) ...
    if (icon_svg !== null) dataToUpdate.icon_svg = icon_svg;
    if (meta_title !== null) dataToUpdate.meta_title = meta_title;
    if (meta_description !== null) dataToUpdate.meta_description = meta_description;
    if (features !== null) dataToUpdate.features = features; // features is already parsed
    if (call_to_action_label !== null) dataToUpdate.call_to_action_label = call_to_action_label;
    if (call_to_action_link !== null) dataToUpdate.call_to_action_link = call_to_action_link;
    if (display_order_string !== null) dataToUpdate.display_order = Number(display_order_string);
    dataToUpdate.updated_at = new Date().toISOString(); // Manually set updated_at

    console.log("API: Data to update in Supabase:", JSON.stringify(dataToUpdate, null, 2));
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('service_pages')
      .update(dataToUpdate)
      .eq('id', serviceId)
      .select()
      .single();

    if (updateError) { /* ... handle update error, check for FK violation on parent_service_slug ... */ 
        console.error('API: Supabase error updating service:', JSON.stringify(updateError, null, 2));
        return NextResponse.json({ message: 'Failed to update service.', error: updateError.message, details: updateError.details }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service updated successfully!', service: updatedData });
  } catch (error: any) { /* ... handle top-level error ... */ }
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
        // Optional: Fetch service to get image URL before deleting DB record
        const { data: serviceToDelete, error: fetchErr } = await supabaseAdmin
            .from('service_pages').select('hero_image_url').eq('id', serviceId).single();

        // Delete record from database
        const { error: deleteError } = await supabaseAdmin
            .from('service_pages')
            .delete()
            .eq('id', serviceId);

        if (deleteError) {
            console.error('API: Supabase error deleting service record:', JSON.stringify(deleteError, null, 2));
            return NextResponse.json({ message: 'Failed to delete service record.', error: deleteError.message }, { status: 500 });
        }

        // If DB record deleted successfully, try to delete image from storage
        if (serviceToDelete?.hero_image_url) {
            try {
                const fileName = serviceToDelete.hero_image_url.split('/').pop();
                if (fileName) {
                    const { error: storageError } = await supabaseAdmin.storage
                        .from(SUPABASE_SERVICES_IMAGE_BUCKET)
                        .remove([`public/${fileName}`]); // Ensure path matches upload path
                    if (storageError) {
                        console.warn('API: Failed to delete image from storage, but DB record deleted:', JSON.stringify(storageError, null, 2));
                        // Don't fail the whole request if only image deletion fails, but log it.
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