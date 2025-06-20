// src/app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { BlogPost, BlogPostCategory } from '@/types'; // Ensure BlogPostCategory is imported if used
import { v4 as uuidv4 } from 'uuid';

// Optional: For backend session/role validation
// import { getToken } from 'next-auth/jwt';
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(req: NextRequest) {
  // Optional: Backend authorization check
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // if (!token || token.email !== ADMIN_EMAIL) {
  //   return NextResponse.json({ message: 'Unauthorized: Admin access required.' }, { status: 401 });
  // }

  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized. Check server logs and SUPABASE_SERVICE_ROLE_KEY environment variable.");
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }

  let uploadedImagePathInStorage: string | null = null;

  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as BlogPostCategory | null; // Allow null if category can be optional
    const excerpt = formData.get('excerpt') as string | null;
    const content = formData.get('content') as string;
    const author_name = formData.get('author_name') as string | null;
    const published_at_string = formData.get('published_at') as string | null; // From combined date & time
    const imageFile = formData.get('imageFile') as File | null;

    // --- Validation ---
    if (!title || !slug || !content) {
      return NextResponse.json({ message: 'Missing required fields: title, slug, and content are required.' }, { status: 400 });
    }
    // Add more validation as needed (e.g., for slug format, content length)
    // --- End Validation ---

    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const uniqueFileName = `article_${slug}_${uuidv4().slice(0,8)}.${fileExt}`; // More descriptive name
      const filePath = `public/articles/${uniqueFileName}`; // Store in 'public/articles' folder within bucket
      uploadedImagePathInStorage = filePath;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images') // <<--- YOUR BUCKET NAME (can be same as products or a new one like 'blog-assets')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase Storage upload error for article image:', uploadError);
        throw new Error(`Failed to upload article image: ${uploadError.message}`);
      }
      if (!uploadData?.path) {
        throw new Error('Article image upload succeeded but no path was returned from storage.');
      }
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images') // <<--- YOUR BUCKET NAME
        .getPublicUrl(uploadData.path);

      if (!publicUrlData?.publicUrl) {
        await supabaseAdmin.storage.from('product-images').remove([uploadData.path]);
        uploadedImagePathInStorage = null;
        throw new Error('Failed to get public URL for the uploaded article image.');
      }
      imageUrl = publicUrlData.publicUrl;
    }

    // Prepare data for Supabase 'articles' table
    // Supabase generates 'id' and 'created_at'
    const articleToInsert: Omit<BlogPost, 'id' | 'created_at'> = {
      title,
      slug,
      content,
      category: category || null,
      excerpt: excerpt || null,
      author_name: author_name || null,
      image_url: imageUrl, // This will be null if no image was uploaded
      published_at: published_at_string ? new Date(published_at_string).toISOString() : null, // Store as ISO string or null
      // date field from your original static data is not here, assuming published_at replaces it
    };

    const { data: insertedArticleData, error: insertError } = await supabaseAdmin
      .from('articles') // Your database table name for articles
      .insert([articleToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase DB insert error for article:', insertError);
      if (uploadedImagePathInStorage) {
         await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
      }
      throw new Error(`Failed to add article to database: ${insertError.message}`);
    }
    
    if (!insertedArticleData) {
        if (uploadedImagePathInStorage) {
             await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
        }
        throw new Error("Article data was not returned after insert into database.");
    }

    const newArticle = insertedArticleData as unknown as BlogPost;

    return NextResponse.json({ message: 'Article added successfully!', article: newArticle }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to add article (API Global Catch):", error);
    if (uploadedImagePathInStorage && error.message.indexOf('upload article image') === -1 && error.message.indexOf('public URL for the uploaded article image') === -1) {
        try {
            await supabaseAdmin.storage.from('product-images').remove([uploadedImagePathInStorage]);
        } catch (cleanupError: any) {
            console.error("Failed to rollback article image storage upload:", cleanupError.message);
        }
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}