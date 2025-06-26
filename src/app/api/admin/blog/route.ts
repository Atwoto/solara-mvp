// src/app/api/admin/blog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Import from the central auth lib
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { BlogPost, BlogPostCategory } from '@/types'; // Ensure BlogPost and its category type are imported

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
// Use a dedicated bucket for article images for better organization
const SUPABASE_ARTICLES_IMAGE_BUCKET = 'article-images'; 

// POST: Create a new blog article
export async function POST(req: NextRequest) {
  console.log("API: POST /api/admin/blog hit");
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  let uploadedImagePathInStorage: string | null = null;

  try {
    const formData = await req.formData();
    
    // Extract fields from FormData
    const title = formData.get('title') as string | null;
    const slug = formData.get('slug') as string | null;
    const content = formData.get('content') as string | null;
    const category = formData.get('category') as BlogPostCategory | null;
    const excerpt = formData.get('excerpt') as string | null;
    const author_name = formData.get('author_name') as string | null;
    const published_at_string = formData.get('published_at') as string | null;
    const imageFile = formData.get('imageFile') as File | null;

    if (!title || !slug || !content) {
      return NextResponse.json({ message: 'Title, slug, and content are required.' }, { status: 400 });
    }

    let uploadedImageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `public/${fileName}`;
        uploadedImagePathInStorage = filePath; // Save path for potential rollback

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(SUPABASE_ARTICLES_IMAGE_BUCKET)
            .upload(filePath, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type });

        if (uploadError) {
            console.error('API BLOG POST: Supabase storage upload error:', uploadError);
            throw new Error(`Failed to upload article image: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).getPublicUrl(uploadedImagePathInStorage);
        uploadedImageUrl = publicUrlData.publicUrl;
    }
    
    // Prepare data for the 'articles' table, using camelCase for properties
    // This now matches your BlogPost type from src/types.ts
    const articleToInsert: Omit<BlogPost, 'id' | 'created_at'> = {
      title,
      slug,
      content,
      category: category || null,
      excerpt: excerpt || null,
      author_name: author_name || (session.user.name || 'Admin'), // Default to session user's name
      // --- FIX IS HERE: Changed image_url to imageUrl ---
      image_url: uploadedImageUrl, // Changed back to snake_case to match the BlogPost type
      published_at: published_at_string ? new Date(published_at_string).toISOString() : null,
    };

    const { data: insertedArticleData, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert([articleToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('API BLOG POST: Supabase DB insert error:', insertError);
      // If DB insert fails, try to clean up the uploaded image from storage
      if (uploadedImagePathInStorage) {
        await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([uploadedImagePathInStorage]);
        console.log("Rolled back image upload due to DB insert failure.");
      }
      // Check for specific unique constraint violation on slug
      if (insertError.code === '23505' && insertError.message.includes('slug')) {
         return NextResponse.json({ message: `Failed to create article: The slug "${slug}" already exists.` }, { status: 409 });
      }
      return NextResponse.json({ message: 'Failed to add article to database.', error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Article created successfully!', article: insertedArticleData }, { status: 201 });

  } catch (error: any) {
    console.error("API BLOG POST: Unhandled error:", error.message, error.stack);
    // This outer catch handles errors from formData parsing, image upload, etc.
    // Clean up uploaded image if it exists and the error happened *after* upload
    if (uploadedImagePathInStorage) {
        try {
            await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([uploadedImagePathInStorage]);
            console.log("Rolled back image upload due to unhandled error.");
        } catch (cleanupError: any) {
            console.error("Failed to rollback article image storage upload:", cleanupError.message);
        }
    }
    return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}