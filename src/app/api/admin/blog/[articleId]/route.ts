// src/app/api/admin/blog/[articleId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { BlogPost, BlogPostCategory } from '@/types'; // Ensure these are correctly defined in @/types
import { v4 as uuidv4 } from 'uuid';

// --- PUT Handler (for updating an article) ---
export async function PUT(req: NextRequest, { params }: { params: { articleId: string } }) {
  // Optional: Add robust admin authentication check here
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized for PUT /api/admin/blog/[articleId].");
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }
  
  const articleId = params.articleId;
  if (!articleId) {
    return NextResponse.json({ message: 'Article ID is required in the URL path.' }, { status: 400 });
  }

  let newUploadedImagePathInStorage: string | null = null; // To track new image for potential rollback

  try {
    const formData = await req.formData();

    // Extract and validate fields
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string; // Be cautious about allowing slug updates
    const category = formData.get('category') as BlogPostCategory | '' | null;
    const excerpt = formData.get('excerpt') as string | null;
    const content = formData.get('content') as string;
    const author_name = formData.get('author_name') as string | null;
    const published_at_string = formData.get('published_at') as string | null; // Sent as combined ISO string from form
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null; // URL of the existing image

    if (!title || !slug || !content) {
      return NextResponse.json({ message: 'Title, Slug, and Content are required fields.' }, { status: 400 });
    }
    if (category === '') { // If category is sent as empty string, treat as null or a default
        // return NextResponse.json({ message: 'Category is required.' }, { status: 400 });
    }


    let finalImageUrl = currentImageUrl || null; // Start with current image URL

    if (imageFile && imageFile.size > 0) {
      // 1. If a new image is provided, upload it
      const fileExt = imageFile.name.split('.').pop();
      const uniqueFileName = `article_${slug}_${uuidv4().slice(0,8)}.${fileExt}`;
      const filePath = `public/articles/${uniqueFileName}`; // Example path structure
      newUploadedImagePathInStorage = filePath;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images') // <<--- REPLACE WITH YOUR BUCKET NAME
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false, // Set to true if you want to overwrite based on filePath, false to error if exists
        });

      if (uploadError) throw new Error(`Failed to upload new image: ${uploadError.message}`);
      if (!uploadData?.path) throw new Error('New image upload succeeded but no path was returned.');
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images') // <<--- REPLACE WITH YOUR BUCKET NAME
        .getPublicUrl(uploadData.path);

      if (!publicUrlData?.publicUrl) {
        // Attempt to clean up the newly uploaded file if URL retrieval fails
        await supabaseAdmin.storage.from('product-images').remove([uploadData.path]);
        newUploadedImagePathInStorage = null;
        throw new Error('Failed to get public URL for the newly uploaded image.');
      }
      finalImageUrl = publicUrlData.publicUrl;

      // 2. If new image uploaded successfully, delete the old one from storage (if it existed and is different)
      if (currentImageUrl && currentImageUrl !== finalImageUrl) {
        try {
          const urlObject = new URL(currentImageUrl);
          const pathSegments = urlObject.pathname.split('/');
          const bucketNameInPath = 'product-images'; // <<--- REPLACE
          const bucketIndex = pathSegments.indexOf(bucketNameInPath);
          if (bucketIndex !== -1 && bucketIndex < pathSegments.length -1) {
            const oldStoragePath = pathSegments.slice(bucketIndex + 1).join('/');
            if (oldStoragePath) {
              await supabaseAdmin.storage.from(bucketNameInPath).remove([oldStoragePath]);
              console.log(`Successfully deleted old image from storage: ${oldStoragePath}`);
            }
          } else {
             console.warn(`Could not parse old image storage path from URL: ${currentImageUrl}`);
          }
        } catch (e: any) { 
          console.error("Failed to delete old image from storage during update:", e.message); 
          // Non-critical, log and continue with the update.
        }
      }
    }

    // Prepare data for updating the 'articles' table
    const articleToUpdate = {
      title: title.trim(),
      // slug: slug.trim(), // Generally, avoid updating slugs. If you do, handle redirects.
      content: content, // Assumed to be HTML from TipTap
      category: category || null,
      excerpt: excerpt?.trim() || null,
      author_name: author_name?.trim() || null,
      image_url: finalImageUrl, // This will be the new URL or the existing one
      published_at: published_at_string ? new Date(published_at_string).toISOString() : null,
      // Supabase automatically updates an 'updated_at' column if you have one with a default like now() or a trigger
    };

    const { data: updatedArticleData, error: updateError } = await supabaseAdmin
      .from('articles')
      .update(articleToUpdate)
      .eq('id', articleId)
      .select() // Select all columns of the updated row
      .single(); // We expect a single row to be returned

    if (updateError) {
      // If DB update fails but we uploaded a new image, try to remove the new image
      if (newUploadedImagePathInStorage) {
        await supabaseAdmin.storage.from('product-images').remove([newUploadedImagePathInStorage]);
      }
      throw new Error(`Database update error: ${updateError.message}`);
    }
    
    if (!updatedArticleData) {
        // This case implies the articleId didn't match any row, or select failed.
        if (newUploadedImagePathInStorage) {
             await supabaseAdmin.storage.from('product-images').remove([newUploadedImagePathInStorage]);
        }
        throw new Error("Article data was not returned after update, or article not found.");
    }

    const refreshedArticle = updatedArticleData as unknown as BlogPost;

    return NextResponse.json({ message: 'Article updated successfully!', article: refreshedArticle }, { status: 200 });

  } catch (error: any) {
    console.error("Failed to update article (API Global Catch):", error.message);
    // Last-ditch effort to clean up a new image if one was uploaded and not yet cleaned by other error paths
    if (newUploadedImagePathInStorage && 
        !error.message.includes('upload new image') && 
        !error.message.includes('public URL for the newly uploaded image')) {
        try {
            await supabaseAdmin.storage.from('product-images').remove([newUploadedImagePathInStorage]);
        } catch (cleanupError: any) {
            console.error("Failed to rollback new article image storage upload during PUT error:", cleanupError.message);
        }
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error while updating article.' }, { status: 500 });
  }
}


// --- DELETE Handler ---
export async function DELETE(req: NextRequest, { params }: { params: { articleId: string } }) {
  // Optional: Add robust admin authentication check here
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized for DELETE /api/admin/blog/[articleId].");
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }

  const articleId = params.articleId;
  if (!articleId) {
    return NextResponse.json({ message: 'Article ID is required in the URL path.' }, { status: 400 });
  }

  try {
    // 1. Get the article to find its image_url for deletion from storage.
    const { data: articleData, error: fetchError } = await supabaseAdmin
        .from('articles')
        .select('image_url') // Only select the image_url
        .eq('id', articleId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "Searched for a single row, but got 0 rows"
        throw new Error(`Error fetching article details for deletion: ${fetchError.message}`);
    }

    // 2. Delete the article from the database.
    // Supabase .delete() does not error if the row doesn't exist, it just affects 0 rows.
    const { error: deleteError } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (deleteError) {
      // This error is critical as it means the DB operation itself failed.
      throw new Error(`Database delete error: ${deleteError.message}`);
    }

    // 3. If article existed (articleData is not null) and had an image_url, delete it from storage.
   // ... inside the DELETE function, after fetching articleData ...

    if (articleData && typeof articleData.image_url === 'string' && articleData.image_url.trim() !== '') {
      const imageUrlString = articleData.image_url; // Now TypeScript knows this is a non-empty string
      try {
        const urlObject = new URL(imageUrlString); // This should now be fine
        const pathSegments = urlObject.pathname.split('/');
        const bucketNameInPath = 'product-images'; // <<--- REPLACE
        const bucketIndex = pathSegments.indexOf(bucketNameInPath);

        if (bucketIndex !== -1 && bucketIndex < pathSegments.length -1) {
            const storagePath = pathSegments.slice(bucketIndex + 1).join('/'); 
            if (storagePath) {
                console.log(`Attempting to delete image from storage: ${storagePath}`);
                const { error: storageDeleteError } = await supabaseAdmin.storage
                    .from(bucketNameInPath)
                    .remove([storagePath]);
                
                if (storageDeleteError) {
                    console.error("Supabase Storage: Failed to delete image, but article was deleted from DB:", storageDeleteError.message);
                } else {
                    console.log(`Successfully deleted image from storage: ${storagePath}`);
                }
            } else {
                 console.warn(`Could not determine a valid storage path to delete from URL: ${imageUrlString}`);
            }
        } else {
            console.warn(`Could not determine storage path from URL: ${imageUrlString}. Bucket name "${bucketNameInPath}" not found or path structure issue.`);
        }
      } catch (e: any) {
        console.error("Error processing or deleting image from storage:", e.message);
      }
    } else if (articleData && !articleData.image_url) {
        console.log(`Article ID ${articleId} deleted from DB, no image_url was associated.`);
    } else {
        console.log(`Article ID ${articleId} not found or already deleted prior to this operation. No storage action taken.`);
    }


    return NextResponse.json({ message: 'Article deleted successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error("Failed to delete article (API Global Catch):", error.message);
    return NextResponse.json({ message: error.message || 'Internal Server Error while deleting article.' }, { status: 500 });
  }
}