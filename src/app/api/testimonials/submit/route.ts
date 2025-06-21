// src/app/api/testimonials/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient'; // Use admin client for inserts
import { Testimonial } from '@/types'; // Your Testimonial type
import { v4 as uuidv4 } from 'uuid';

// Optional: For sending email notifications to admin
// import nodemailer from 'nodemailer'; 

// Define a more flexible insert type that matches your database structure
type TestimonialInsert = {
  client_name: string;
  client_title_company?: string | null;
  quote: string;
  rating?: number | null;
  image_url?: string | null;
  is_featured: boolean;
  approved: boolean;
  email_internal?: string;
};

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
    
    // Additional validation
    if (quote.trim().length < 10) {
      return NextResponse.json({ message: 'Quote must be at least 10 characters long.' }, { status: 400 });
    }
    if (client_name.trim().length < 2) {
      return NextResponse.json({ message: 'Name must be at least 2 characters long.' }, { status: 400 });
    }
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
    const testimonialToInsert: TestimonialInsert = {
      client_name: client_name.trim(),
      client_title_company: client_title_company?.trim() || null,
      quote: quote.trim(),
      rating: rating,
      image_url: imageUrlFromStorage, // This will be null if no image was uploaded
      is_featured: false, // Default not featured
      approved: false, // <<--- IMPORTANT: Submitted testimonials are not approved by default
      email_internal: email, // Store the submitter's email for internal reference
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
    await sendAdminNotificationEmail(insertedTestimonial as Testimonial, email);

    return NextResponse.json({ 
      message: 'Thank you! Your testimonial has been submitted for review.',
      testimonialId: insertedTestimonial.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to submit testimonial (API Global Catch):", error.message);
    
    // Cleanup uploaded image if there was an error after upload
    if (uploadedImagePathInStorage && !error.message.includes('upload image') && !error.message.includes('public URL')) {
        try { 
          await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]); 
        }
        catch (cleanupError: any) { 
          console.error("Failed to rollback image storage upload:", cleanupError.message); 
        }
    }
    
    return NextResponse.json({ 
      message: error.message || 'Internal Server Error.' 
    }, { status: 500 });
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Enhanced admin notification email function
async function sendAdminNotificationEmail(testimonial: Testimonial, submitterEmail: string) {
  console.log(`New testimonial submitted by ${testimonial.client_name} (${submitterEmail}). Needs approval.`);
  
  // Uncomment and configure if you want to send actual emails
  /*
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: 'New Testimonial Submitted for Bills On Solar',
      html: `
        <h2>New Testimonial Submission</h2>
        <p><strong>Name:</strong> ${testimonial.client_name}</p>
        <p><strong>Email:</strong> ${submitterEmail}</p>
        <p><strong>Company/Title:</strong> ${testimonial.client_title_company || 'Not provided'}</p>
        <p><strong>Rating:</strong> ${testimonial.rating ? `${testimonial.rating}/5 stars` : 'Not provided'}</p>
        <p><strong>Quote:</strong></p>
        <blockquote>"${testimonial.quote}"</blockquote>
        ${testimonial.image_url ? `<p><strong>Image:</strong> <a href="${testimonial.image_url}">View Image</a></p>` : ''}
        <p>Please review and approve this testimonial in your admin panel.</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    });
    
    console.log('Admin notification email sent successfully');
  } catch (emailError: any) {
    console.error("Failed to send admin notification email:", emailError.message);
  }
  */
}