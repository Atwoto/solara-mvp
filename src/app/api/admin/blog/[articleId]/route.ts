// src/app/api/admin/blog/[articleId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kenbillsonsolararea@gmail.com';
const SUPABASE_ARTICLES_IMAGE_BUCKET = 'article-images';

interface RouteParams {
    params: { articleId: string };
}

/**
 * GET: Fetches a single blog article by its ID.
 * This is the missing piece that caused the "Unexpected end of JSON input" error.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { articleId } = params;
    if (!articleId) {
        return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Specific code for "row not found"
                return NextResponse.json({ message: 'Article not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`API Error (GET Article ${articleId}):`, error);
        return NextResponse.json({ message: 'Failed to fetch article', error: error.message }, { status: 500 });
    }
}


/**
 * PUT: Updates an existing blog article.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { articleId } = params;
    let newUploadedImagePathInStorage: string | null = null;

    try {
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const slug = formData.get('slug') as string;
        const category = formData.get('category') as string | null;
        const excerpt = formData.get('excerpt') as string | null;
        const published_at = formData.get('published_at') as string | null;
        const imageFile = formData.get('imageFile') as File | null;
        const currentImageUrl = formData.get('currentImageUrl') as string | null;

        if (!title || !content || !slug) {
            return NextResponse.json({ message: 'Title, Slug, and Content are required.' }, { status: 400 });
        }

        const dataToUpdate: { [key: string]: any } = {
            title,
            content,
            slug,
            category,
            excerpt,
            published_at: published_at ? new Date(published_at).toISOString() : null,
            updated_at: new Date().toISOString(),
        };

        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExt}`;
            newUploadedImagePathInStorage = `public/${uniqueFileName}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from(SUPABASE_ARTICLES_IMAGE_BUCKET)
                .upload(newUploadedImagePathInStorage, imageFile);

            if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
            
            const { data: publicUrlData } = supabaseAdmin.storage
                .from(SUPABASE_ARTICLES_IMAGE_BUCKET)
                .getPublicUrl(uploadData.path);
            
            dataToUpdate.image_url = publicUrlData.publicUrl;

            if (currentImageUrl) {
                try {
                    const oldStoragePath = `public/${currentImageUrl.split('/').pop()}`;
                    await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([oldStoragePath]);
                } catch (e) {
                    console.error("Non-fatal: Failed to delete old image from storage:", e);
                }
            }
        }

        const { data: updatedArticleData, error: updateError } = await supabaseAdmin
            .from('articles')
            .update(dataToUpdate)
            .eq('id', articleId)
            .select()
            .single();

        if (updateError) throw updateError;
        
        return NextResponse.json({ message: 'Article updated successfully!', article: updatedArticleData }, { status: 200 });

    } catch (error: any) {
        console.error(`API Error (PUT Article ${articleId}):`, error);
        if (newUploadedImagePathInStorage) {
            await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([newUploadedImagePathInStorage]);
        }
        return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
    }
}

/**
 * DELETE: Deletes a blog article and its associated image.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { articleId } = params;

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
                const oldStoragePath = `public/${articleData.image_url.split('/').pop()}`;
                await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([oldStoragePath]);
            } catch (e) {
                console.error("DB entry deleted, but failed to delete image from storage:", e);
            }
        }
        
        return NextResponse.json({ message: 'Article deleted successfully!' }, { status: 200 });

    } catch (error: any) {
        console.error(`API Error (DELETE Article ${articleId}):`, error);
        return NextResponse.json({ message: error.message || 'Internal Server Error.' }, { status: 500 });
    }
}
