// src/app/api/admin/knowledge/generate-embeddings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';
import OpenAI from 'openai';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to generate an embedding for a chunk of text
async function generateEmbedding(text: string): Promise<number[] | null> {
  // OpenAI recommends replacing newlines with spaces for better performance
  const cleanText = text.replace(/\n/g, ' ');
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small", // A powerful and cost-effective model
      input: cleanText,
    });
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    let upsertedCount = 0;
    
    // 1. Process Products
    const { data: products, error: productsError } = await supabaseAdmin.from('products').select('*');
    if (productsError) throw productsError;
    for (const product of products) {
      const content = `Product Name: ${product.name}. Category: ${product.category}. Description: ${product.description}. Price: Ksh ${product.price}. Wattage: ${product.wattage || 'N/A'}W.`;
      const embedding = await generateEmbedding(content);
      if (embedding) {
        await supabaseAdmin.from('knowledge_base').upsert({
          source_type: 'product',
          source_id: product.id,
          content: content,
          embedding: embedding,
          metadata: { title: product.name, url: `/products/${product.id}` }
        });
        upsertedCount++;
      }
    }

    // 2. Process Services
    const { data: services, error: servicesError } = await supabaseAdmin.from('service_pages').select('*').eq('status', 'published');
    if (servicesError) throw servicesError;
    for (const service of services) {
      // For services with long HTML, you might want to strip HTML tags for a cleaner embedding content
      const cleanContent = service.content_html.replace(/<[^>]*>?/gm, ' '); // Simple HTML strip
      const content = `Service Title: ${service.title}. Summary: ${service.excerpt}. Details: ${cleanContent}`;
      const embedding = await generateEmbedding(content);
      if (embedding) {
        await supabaseAdmin.from('knowledge_base').upsert({
          source_type: 'service',
          source_id: service.id,
          content: content,
          embedding: embedding,
          metadata: { title: service.title, url: `/services/${service.slug}` }
        });
        upsertedCount++;
      }
    }

    // 3. Process Articles
    const { data: articles, error: articlesError } = await supabaseAdmin.from('articles').select('*').filter('published_at', 'lte', new Date().toISOString());
    if (articlesError) throw articlesError;
    for (const article of articles) {
      const cleanContent = article.content.replace(/<[^>]*>?/gm, ' ');
      const content = `Article Title: ${article.title}. Category: ${article.category}. Excerpt: ${article.excerpt}. Content: ${cleanContent}`;
      const embedding = await generateEmbedding(content);
      if (embedding) {
        await supabaseAdmin.from('knowledge_base').upsert({
          source_type: 'article',
          source_id: article.id,
          content: content,
          embedding: embedding,
          metadata: { title: article.title, url: `/blog/${article.slug}` }
        });
        upsertedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully generated and stored embeddings for ${upsertedCount} items.` });

  } catch (error: any) {
    console.error("Error in generate-embeddings API:", error);
    return NextResponse.json({ message: 'Failed to generate embeddings.', error: error.message }, { status: 500 });
  }
}