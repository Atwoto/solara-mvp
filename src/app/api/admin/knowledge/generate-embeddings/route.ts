// src/app/api/admin/knowledge/generate-embeddings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
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

// Define types for the data structures
interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  price: number;
  wattage?: number;
}

interface Service {
  id: string;
  title: string;
  excerpt?: string;
  content_html: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  category?: string;
  excerpt?: string;
  content: string;
  slug: string;
}

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

// Helper function to safely get string value
function getStringValue(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

// Helper function to safely get number value
function getNumberValue(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' ? value : fallback;
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
    
    if (products) {
      for (const product of products) {
        const name = getStringValue(product.name);
        const category = getStringValue(product.category, 'N/A');
        const description = getStringValue(product.description, 'No description available');
        const price = getNumberValue(product.price);
        const wattage = getNumberValue(product.wattage);
        
        const content = `Product Name: ${name}. Category: ${category}. Description: ${description}. Price: Ksh ${price}. Wattage: ${wattage || 'N/A'}W.`;
        const embedding = await generateEmbedding(content);
        if (embedding) {
          await supabaseAdmin.from('knowledge_base').upsert({
            source_type: 'product',
            source_id: product.id,
            content: content,
            embedding: embedding,
            metadata: { title: name, url: `/products/${product.id}` }
          });
          upsertedCount++;
        }
      }
    }

    // 2. Process Services
    const { data: services, error: servicesError } = await supabaseAdmin.from('service_pages').select('*').eq('status', 'published');
    if (servicesError) throw servicesError;
    
    if (services) {
      for (const service of services) {
        // For services with long HTML, you might want to strip HTML tags for a cleaner embedding content
        const contentHtml = getStringValue(service.content_html);
        const cleanContent = contentHtml.replace(/<[^>]*>?/gm, ' '); // Simple HTML strip
        const title = getStringValue(service.title);
        const excerpt = getStringValue(service.excerpt, '');
        const slug = getStringValue(service.slug);
        
        const content = `Service Title: ${title}. Summary: ${excerpt}. Details: ${cleanContent}`;
        const embedding = await generateEmbedding(content);
        if (embedding) {
          await supabaseAdmin.from('knowledge_base').upsert({
            source_type: 'service',
            source_id: service.id,
            content: content,
            embedding: embedding,
            metadata: { title: title, url: `/services/${slug}` }
          });
          upsertedCount++;
        }
      }
    }

    // 3. Process Articles
    const { data: articles, error: articlesError } = await supabaseAdmin.from('articles').select('*').filter('published_at', 'lte', new Date().toISOString());
    if (articlesError) throw articlesError;
    
    if (articles) {
      for (const article of articles) {
        const articleContent = getStringValue(article.content);
        const cleanContent = articleContent.replace(/<[^>]*>?/gm, ' ');
        const title = getStringValue(article.title);
        const category = getStringValue(article.category, 'Uncategorized');
        const excerpt = getStringValue(article.excerpt, '');
        const slug = getStringValue(article.slug);
        
        const content = `Article Title: ${title}. Category: ${category}. Excerpt: ${excerpt}. Content: ${cleanContent}`;
        const embedding = await generateEmbedding(content);
        if (embedding) {
          await supabaseAdmin.from('knowledge_base').upsert({
            source_type: 'article',
            source_id: article.id,
            content: content,
            embedding: embedding,
            metadata: { title: title, url: `/blog/${slug}` }
          });
          upsertedCount++;
        }
      }
    }

    return NextResponse.json({ message: `Successfully generated and stored embeddings for ${upsertedCount} items.` });

  } catch (error: any) {
    console.error("Error in generate-embeddings API:", error);
    return NextResponse.json({ message: 'Failed to generate embeddings.', error: error.message }, { status: 500 });
  }
}