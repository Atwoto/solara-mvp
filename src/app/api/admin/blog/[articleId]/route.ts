// /src/app/api/admin/blog/[articleId]/route.ts -- FINAL CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { BlogPost, BlogPostCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- THE FINAL FIX: Import supabaseAdmin directly ---
import { supabaseAdmin } from '@/lib/supabase/server';

// --- PUT Handler (for updating an article) ---
export async function PUT(req: NextRequest, { params }: { params: { articleId: string } }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }
  
  const articleId = params.articleId;
  if (!articleId) {
    return NextResponse.json({ message: 'Article ID is required.' }, { status: 400 });
  }

  let newUploadedImagePathInStorage: string | null = null;

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null;

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and Content are required.' }, { status: 400 });
    }

    let finalImageUrl = currentImageUrl || null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const uniqueFileName = `article_${uuidv4()}.${fileExt}`;
      newUploadedImagePathInStorage = `public/articles/${uniqueFileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(newUploadedImagePathInStorage, imageFile);

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      finalImageUrl = publicUrlData.publicUrl;

      if (currentImageUrl) {
        try {
          const oldStoragePath = `public/articles/${currentImageUrl.split('/').pop()}`;
          await supabaseAdmin.storage.from('product-images').remove([oldStoragePath]);
        } catch (e) {
          console.error("Failed to delete old image from storage:", e);
        }
      }
    }

    const { data: updatedArticleData, error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ title, content, image_url: finalImageUrl })
      .eq('id', articleId)
      .select()
      .single();

    if (updateError) throw updateError;
    
    return NextResponse.json({ message: 'Article updated successfully!', article: updatedArticleData }, { status: 200 });

  } catch (error: any) {
    if (newUploadedImagePathInStorage) {
      await supabaseAdmin.storage.from('product-images').remove([newUploadedImagePathInStorage]);
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
  }
}

// --- DELETE Handler ---
export async function DELETE(req: NextRequest, { params }: { params: { articleId: string } }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  const articleId = params.articleId;
  if (!articleId) {
    return NextResponse.json({ message: 'Article ID is required.' }, { status: 400 });
  }

  try {
    const { data: articleData, error: fetchError } = await supabaseAdmin
        .from('articles')
        .select('image_url')
        .eq('id', articleId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const { error: deleteError } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (deleteError) throw deleteError;

    if (articleData?.image_url) {
      try {
        const oldStoragePath = `public/articles/${articleData.image_url.split('/').pop()}`;
        await supabaseAdmin.storage.from('product-images').remove([oldStoragePath]);
      } catch (e) {
        console.error("Failed to delete image from storage, but DB entry was removed:", e);
      }
    }
    
    return NextResponse.json({ message: 'Article deleted successfully!' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
  }
}