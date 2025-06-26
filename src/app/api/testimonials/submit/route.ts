// src/app/api/testimonials/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server'; // Use admin client for inserts
import { Testimonial } from '@/types'; // Your Testimonial type
import { v4 as uuidv4 } from 'uuid';

// Optional: For sending email notifications to admin
// import nodemailer from 'nodemailer'; 

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized for testimonial submission.");
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  let uploadedImagePathInStorage: string | null = null;

  try {
    const formData = await req.formData();

    const client_name = formData.get('client_name') as string;
    const email = formData.get('email') as string; // For your reference, not necessarily public
    const client_title_company = formData.get('client_title_company') as string | null;
    const quote = formData.get('quote') as string;
    const ratingString = formData.get('rating') as string | null;
    const imageFile = formData.get('imageFile') as File | null;
    const consent = formData.get('consent') === 'true';

    // --- Validation ---
    if (!client_name || !email || !quote || !consent) {
      return NextResponse.json({ message: 'Name, Email, Quote, and Consent are required.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
        return NextResponse.json({ message: 'Invalid email format provided.' }, { status: 400 });
    }
    // Add more validation as needed (e.g., quote length)
    // --- End Validation ---

    let rating: number | null = null;
    if (ratingString) {
      const parsedRating = parseInt(ratingString, 10);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        rating = parsedRating;
      }
    }

    let imageUrlFromStorage: string | null = null;

    if (imageFile && imageFile.size > 0) {
      // Validate file type and size (can also be done on client)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ message: 'Invalid image file type. Only JPG, PNG, WEBP allowed.' }, { status: 400 });
      }
      if (imageFile.size > 2 * 1024 * 1024) { // Max 2MB for user uploads
        return NextResponse.json({ message: 'Image file too large. Maximum 2MB allowed.' }, { status: 400 });
      }

      const fileExt = imageFile.name.split('.').pop();
      const uniqueFileName = `testimonial_${uuidv4().slice(0,12)}.${fileExt}`;
      // Store user-submitted images in a specific subfolder for easier management/review
      const filePath = `public/user-testimonials/${uniqueFileName}`; 
      uploadedImagePathInStorage = filePath;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images') // Use your designated bucket, e.g., 'product-images' or a new 'testimonials-bucket'
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
      if (!uploadData?.path) throw new Error('Image upload succeeded but no path returned.');
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images') // Same bucket
        .getPublicUrl(uploadData.path);

      if (!publicUrlData?.publicUrl) {
        await supabaseAdmin.storage.from('product-images').remove([uploadData.path]);
        uploadedImagePathInStorage = null;
        throw new Error('Failed to get public URL for the uploaded image.');
      }
      imageUrlFromStorage = publicUrlData.publicUrl;
    }

    // Data to insert into 'testimonials' table
    // Note: 'approved' is set to false by default for customer submissions
    const testimonialToInsert: Omit<Testimonial, 'id' | 'created_at'> & { email_internal?: string } = {
      client_name: client_name.trim(),
      client_title_company: client_title_company?.trim() || null,
      quote: quote.trim(),
      rating: rating,
      image_url: imageUrlFromStorage, // This will be null if no image was uploaded
      is_featured: false, // Default not featured
      approved: false, // <<--- IMPORTANT: Submitted testimonials are not approved by default
      // email_internal: email, // Optional: if you add an internal email column to testimonials table
    };

    const { data: insertedTestimonial, error: insertError } = await supabaseAdmin
      .from('testimonials')
      .insert([testimonialToInsert])
      .select()
      .single();

    if (insertError) {
      if (uploadedImagePathInStorage) {
         await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
      }
      throw new Error(`Database error: ${insertError.message}`);
    }
    
    if (!insertedTestimonial) {
        if (uploadedImagePathInStorage) {
             await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
        }
        throw new Error("Testimonial data was not returned after insert.");
    }

    // Optional: Send an email notification to admin about new testimonial
    // await sendAdminNotificationEmail(insertedTestimonial as Testimonial, email);

    return NextResponse.json({ message: 'Thank you! Your testimonial has been submitted for review.' }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to submit testimonial (API Global Catch):", error.message);
    if (uploadedImagePathInStorage && !error.message.includes('upload image') && !error.message.includes('public URL')) {
        try { await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]); }
        catch (cleanupError: any) { console.error("Failed to rollback image storage upload:", cleanupError.message); }
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: Placeholder for sending admin notification email
// async function sendAdminNotificationEmail(testimonial: Testimonial, submitterEmail: string) {
//   // Configure Nodemailer or your email service
//   console.log(`New testimonial submitted by ${testimonial.client_name} (${submitterEmail}). Needs approval.`);
//   // try {
//   //   const transporter = nodemailer.createTransport({ /* ... your config ... */ });
//   //   await transporter.sendMail({
//   //     from: process.env.EMAIL_FROM,
//   //     to: process.env.ADMIN_NOTIFICATION_EMAIL,
//   //     subject: 'New Testimonial Submitted for Bills On Solar',
//   //     html: `<p>A new testimonial has been submitted:</p>
//   //            <p><b>Name:</b> ${testimonial.client_name}</p>
//   //            <p><b>Quote:</b> "${testimonial.quote}"</p>
//   //            <p>Please review it in the admin panel.</p>`,
//   //   });
//   // } catch (emailError) {
//   //   console.error("Failed to send admin notification email:", emailError);
//   // }
// }