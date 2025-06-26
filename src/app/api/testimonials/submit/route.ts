// /src/app/api/testimonials/submit/route.ts -- FINAL CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { Testimonial } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- THE FINAL FIX: Import supabaseAdmin directly ---
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized for testimonial submission.");
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  let uploadedImagePathInStorage: string | null = null;

  try {
    const formData = await req.formData();
    const client_name = formData.get('client_name') as string;
    const email = formData.get('email') as string;
    const quote = formData.get('quote') as string;
    const consent = formData.get('consent') === 'true';

    if (!client_name || !email || !quote || !consent) {
      return NextResponse.json({ message: 'Name, Email, Quote, and Consent are required.' }, { status: 400 });
    }

    let imageUrlFromStorage: string | null = null;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const uniqueFileName = `testimonial_${uuidv4()}.${fileExt}`;
      uploadedImagePathInStorage = `public/user-testimonials/${uniqueFileName}`; 

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(uploadedImagePathInStorage, imageFile);

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      imageUrlFromStorage = publicUrlData.publicUrl;
    }

    const testimonialToInsert = {
      client_name: client_name.trim(),
      quote: quote.trim(),
      image_url: imageUrlFromStorage,
      approved: false,
    };

    const { data: insertedTestimonial, error: insertError } = await supabaseAdmin
      .from('testimonials')
      .insert([testimonialToInsert])
      .select()
      .single();

    if (insertError) throw insertError;
    
    return NextResponse.json({ message: 'Thank you! Your testimonial has been submitted for review.' }, { status: 201 });

  } catch (error: any) {
    if (uploadedImagePathInStorage) {
      await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
  }
}