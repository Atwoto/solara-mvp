// src/app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabaseClient'; // Assuming supabase (public) might be used as fallback
import { ServicePageData } from '@/types';
import { getServerSession } from "next-auth/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import type { Session } from 'next-auth'; // For explicit typing
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
const SUPABASE_SERVICES_IMAGE_BUCKET = 'service-images';

// --- POST HANDLER (ensure all paths return) ---
export async function POST(request: NextRequest) {
  console.log("API: POST /api/admin/services hit");

  const session = await getServerSession(authOptions) as Session | null; 
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) { 
    console.error("API: Unauthorized access attempt to POST /api/admin/services");
    return NextResponse.json({ message: 'Unauthorized: Access Denied' }, { status: 403 });
  }
  console.log("API: Admin user authenticated for POST:", session.user.email);

  if (!supabaseAdmin) {
    console.error("API: Supabase admin client is not initialized for POST.");
    return NextResponse.json({ message: 'Server configuration error: Admin database client not available.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    console.log("API: Received FormData keys for POST:", Array.from(formData.keys()));

    const title = formData.get('title') as string | null;
    const slug = formData.get('slug') as string | null;
    const content_html = formData.get('content_html') as string | null;
    const status = (formData.get('status') as ServicePageData['status'] | null) || 'draft';
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

    if (!title || !slug || !content_html) {
      console.error("API: Missing required fields in POST.");
      return NextResponse.json({ message: 'Missing required fields: title, slug, and content are required.' }, { status: 400 });
    }
    
    let features = null;
    if (featuresJsonString) {
        try { features = JSON.parse(featuresJsonString); } 
        catch (e: any) { 
            console.error("API: Invalid JSON for features in POST:", e.message);
            return NextResponse.json({ message: 'Invalid JSON format for features. Error: ' + e.message }, { status: 400 });
        }
    }

    const { data: existingSlug, error: slugError } = await supabaseAdmin
      .from('service_pages').select('slug').eq('slug', slug).maybeSingle();
    if (slugError && slugError.code !== 'PGRST116') { 
        console.error('API: Supabase error checking slug in POST:', JSON.stringify(slugError, null, 2));
        return NextResponse.json({ message: 'Error checking slug uniqueness', error: slugError.message }, { status: 500 });
    }
    if (existingSlug) { 
        console.warn("API: Slug already exists in POST:", slug);
        return NextResponse.json({ message: `Slug "${slug}" already exists.` }, { status: 409 });
    }

    let uploadedHeroImageUrl: string | null = null;
    if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(SUPABASE_SERVICES_IMAGE_BUCKET).upload(`public/${fileName}`, imageFile, { 
                cacheControl: '3600', upsert: false, contentType: imageFile.type,
            });
        if (uploadError) {
            console.error('API: Supabase storage upload error in POST:', JSON.stringify(uploadError, null, 2));
            return NextResponse.json({ message: 'Failed to upload hero image.', error: uploadError.message, details: uploadError }, { status: 500 });
        }
        const { data: publicUrlData } = supabaseAdmin.storage.from(SUPABASE_SERVICES_IMAGE_BUCKET).getPublicUrl(uploadData.path); 
        uploadedHeroImageUrl = publicUrlData.publicUrl;
    }

    const newServiceData = {
      title, slug, content_html, status,
      parent_service_slug: parent_service_slug_from_form && parent_service_slug_from_form.trim() !== '' ? parent_service_slug_from_form.trim() : null,
      excerpt: excerpt || null, hero_image_url: uploadedHeroImageUrl, icon_svg: icon_svg || null,
      meta_title: meta_title || null, meta_description: meta_description || null,
      features: features, call_to_action_label: call_to_action_label || null,
      call_to_action_link: call_to_action_link || null,
      display_order: display_order_string ? Number(display_order_string) : 0,
    };

    const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('service_pages').insert([newServiceData]).select().single();
    if (insertError) {
      console.error('API: Supabase error inserting service into DB (POST):', JSON.stringify(insertError, null, 2));
      if (insertError.code === '23503' && insertError.message.includes('service_pages_parent_service_slug_fkey')) {
        return NextResponse.json({ message: `Parent service slug "${parent_service_slug_from_form}" does not exist.`, details: insertError.details }, { status: 400 });
      }
      if (insertError.code === '23505') { 
        return NextResponse.json({ message: 'Unique constraint violated (e.g., slug already exists).', details: insertError.details }, { status: 409 });
      }
      return NextResponse.json({ message: 'Failed to create service due to database error.', error: insertError.message, details: insertError.details }, { status: 500 });
    }
    console.log("API: Service created successfully in DB (POST):", insertedData);
    return NextResponse.json({ message: "Service created successfully!", service: insertedData }, { status: 201 });
  } catch (error: any) {
    console.error('API: Unhandled top-level error in POST /api/admin/services:', error.message, error.stack);
    return NextResponse.json({ message: 'An unexpected server error occurred in POST.', error: error.message }, { status: 500 });
  }
}

// --- GET HANDLER (Focus of the fix) ---
export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/services hit");
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    console.error("API: Unauthorized access attempt to GET /api/admin/services");
    return NextResponse.json({ message: 'Unauthorized: Access Denied', services: [] }, { status: 403 });
  }
  console.log("API: Admin user authenticated for GET:", session.user.email);

  const clientToUse = supabaseAdmin || supabase; 
  if (!clientToUse) {
    console.error("API: Supabase client is not initialized for GET /api/admin/services.");
    return NextResponse.json({ message: 'Server configuration error: Database client not available.', services: [] }, { status: 500 });
  }

  try {
    console.log("API: Attempting to fetch services from Supabase (GET)...");
    const { data, error } = await clientToUse
      .from('service_pages')
      .select('*')
      .order('display_order', { ascending: true }) 
      .order('created_at', { ascending: false }); 

    if (error) {
        console.error('API: Supabase error fetching services for admin (GET):', JSON.stringify(error, null, 2));
        return NextResponse.json({ message: 'Database error fetching services.', error: error.message, services: [] }, { status: 500 });
    }
    
    console.log("API: Successfully fetched services for admin (GET). Count:", data?.length);
    return NextResponse.json(data as ServicePageData[] || []); // Ensure it returns an array
  } catch (error: any) {
    console.error('API: Unhandled error in GET /api/admin/services:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch services due to an unexpected server error.', error: error.message, services: [] }, { status: 500 });
  }
  // Although it seems all paths are covered by try/catch,
  // adding a fallback return here can sometimes satisfy stricter linting or runtime checks,
  // though ideally the catch block should always be hit if something goes wrong before a successful return.
  // However, if the try block completes without hitting `if (error)` or `return NextResponse.json(data...)`,
  // then this explicit fallback is needed. But this should not happen with the current logic.
  // console.error("API: GET /api/admin/services reached end of function without returning a response. This should not happen.");
  // return NextResponse.json({ message: 'Internal server error: No response generated.', services: [] }, { status: 500 });
}