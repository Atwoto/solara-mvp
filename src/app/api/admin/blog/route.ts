// src/app/api/admin/blog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { BlogPost, BlogPostCategory } from '@/types';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';
const SUPABASE_ARTICLES_IMAGE_BUCKET = 'article-images'; // Standardizing on this bucket

export async function POST(req: NextRequest) {
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
            uploadedImagePathInStorage = filePath;

            const { error: uploadError } = await supabaseAdmin.storage
                .from(SUPABASE_ARTICLES_IMAGE_BUCKET)
                .upload(filePath, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type });

            if (uploadError) {
                throw new Error(`Failed to upload article image: ${uploadError.message}`);
            }
            
            const { data: publicUrlData } = supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).getPublicUrl(uploadedImagePathInStorage);
            uploadedImageUrl = publicUrlData.publicUrl;
        }
        
        const articleToInsert: Omit<BlogPost, 'id' | 'created_at'> = {
            title,
            slug,
            content,
            category: category || null,
            excerpt: excerpt || null,
            author_name: author_name || (session.user.name || 'Admin'),
            image_url: uploadedImageUrl,
            published_at: published_at_string ? new Date(published_at_string).toISOString() : new Date().toISOString(),
        };

        const { data: insertedArticleData, error: insertError } = await supabaseAdmin
            .from('articles')
            .insert([articleToInsert])
            .select()
            .single();

        if (insertError) {
            if (uploadedImagePathInStorage) {
                await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([uploadedImagePathInStorage]);
            }
            if (insertError.code === '23505' && insertError.message.includes('slug')) {
                return NextResponse.json({ message: `Failed to create article: The slug "${slug}" already exists.` }, { status: 409 });
            }
            throw insertError;
        }
        
        return NextResponse.json({ message: 'Article created successfully!', article: insertedArticleData }, { status: 201 });

    } catch (error: any) {
        console.error("API Error creating article:", error);
        if (uploadedImagePathInStorage) {
            try {
                await supabaseAdmin.storage.from(SUPABASE_ARTICLES_IMAGE_BUCKET).remove([uploadedImagePathInStorage]);
            } catch (cleanupError: any) {
                console.error("Failed to rollback article image storage upload:", cleanupError.message);
            }
        }
        return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
    }
}
