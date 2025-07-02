// /src/app/api/chat/route.ts -- FINAL FINAL CORRECTED VERSION
// /src/app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { Product as ProductTypeFromTypes, ServicePageData, BlogPost } from '@/types';
import type { Message } from 'ai'; 

import { supabaseAdmin } from '@/lib/supabase/server';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const stripHtml = (html: string | null | undefined): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim();
};

export async function POST(req: Request) {
  const { messages, cart, wishlist }: { 
    messages: Message[];
    cart: { id: string; name: string; quantity: number }[];
    wishlist: string[];
  } = await req.json();
  
  const dbClient = supabaseAdmin; 

  let productKnowledge = 'No product information available.';
  let serviceKnowledge = 'No installation service information available.';
  let articleKnowledge = 'No blog article information available.';

  try {
    const [productsRes, servicesRes, articlesRes] = await Promise.all([
        dbClient.from('products').select('id, name, price, wattage, category, description'),
        dbClient.from('service_pages').select('id, title, slug, excerpt, content_html').eq('status', 'published'),
        dbClient.from('articles').select('id, title, slug, excerpt, category').filter('published_at', 'lte', new Date().toISOString())
    ]);

    if (productsRes.data && productsRes.data.length > 0) {
      productKnowledge = productsRes.data.map((p: any) => 
        `\n- Product ID: ${p.id}, Name: "${p.name}", Category: "${p.category}", Price: Ksh ${p.price}, Description: "${p.description}"`
      ).join('');
    }
    
    if (servicesRes.data && servicesRes.data.length > 0) {
      serviceKnowledge = servicesRes.data.map((s: any) => 
        `\n- Service: "${s.title}", URL Slug: "/services/${s.slug}", Summary: "${stripHtml(s.excerpt)}"`
      ).join('');
    }
    
    if (articlesRes.data && articlesRes.data.length > 0) {
      articleKnowledge = articlesRes.data.map((a: any) => 
        `\n- Article: "${a.title}", URL Slug: "/blog/${a.slug}", Category: "${a.category}", Summary: "${stripHtml(a.excerpt)}"`
      ).join('');
    }
    
  } catch (e: any) {
    console.error("Chatbot API: Critical error fetching knowledge base:", e.message);
  }
  
  let cartKnowledge = 'The user\'s shopping cart is currently empty.';
  if (cart && cart.length > 0) {
    cartKnowledge = 'The user\'s shopping cart currently contains:' + cart.map(
      (item) => `\n- ${item.quantity}x "${item.name}" (ID: ${item.id})`
    ).join('');
  }

  let wishlistKnowledge = 'The user\'s wishlist is currently empty.';
  if (wishlist && wishlist.length > 0) {
    try {
        const { data: wishlistProducts } = await dbClient.from('products').select('id, name').in('id', wishlist);
        if (wishlistProducts && wishlistProducts.length > 0) {
            wishlistKnowledge = 'The user\'s wishlist currently contains:' + wishlistProducts.map(
                (p: { id: string, name: string }) => `\n- "${p.name}" (ID: ${p.id})`
            ).join('');
        }
    } catch(e) { /* Graceful degradation */ }
  }

  // --- UPGRADED SYSTEM PROMPT WITH AUTO_NAVIGATE ---
  const systemPrompt = `
    Your Identity: You are the "Bills On Solar Assistant", a friendly, expert AI from Bills On Solar EA Limited in Kenya.

    Your Primary Goal: Assist users by answering questions and guiding them through the website. You MUST base your answers strictly on the information provided in the KNOWLEDGE BASE.

    --- KNOWLEDGE BASE ---
    // ... (Knowledge base sections remain the same) ...
    1.  **About Our Company:** ...
    2.  **Our Experience:** ...
    3.  **Available Products:** ${productKnowledge}
    4.  **Installation Services Offered:** ${serviceKnowledge}
    5.  **Available Blog Articles:** ${articleKnowledge}
    6.  **Current User's Shopping Cart:** ${cartKnowledge}
    7.  **Current User's Wishlist:** ${wishlistKnowledge}
    --- END KNOWLEDGE BASE ---

    --- COMMAND & ACTION RULES (VERY IMPORTANT) ---

    1.  **Analyze User Intent:** Understand if the user is asking a question, giving a command, or requesting to go to a page.

    2.  **Answering Questions:** If the user asks a question, answer it conversationally using ONLY information from the knowledge base. If the information is not present, state, "I don't have that specific information, but I can help with..."

    3.  **Automatic Navigation (AUTO_NAVIGATE command):**
        - **USE THIS SPARINGLY.** Only use it when the user's request is a clear, direct, and unambiguous command to go to a specific page.
        - **Examples:** "Take me to the contact page", "Show me your projects", "Go to the blog".
        - **Format:** After your natural language response (e.g., "Of course, taking you to our projects page now..."), add the command on a NEW LINE: AUTO_NAVIGATE[url]
        - **Example Response:**
          Of course, taking you to our projects page now...
          AUTO_NAVIGATE[/projects]

    4.  **Executing Direct Commands (EXECUTE_ACTION):**
        - Use for cart/wishlist actions like "add to cart".
        - Format: EXECUTE_ACTION[actionType|productId]
        - Valid 'actionType': addToCart, removeFromCart, addToWishlist, removeFromWishlist.

    5.  **Proactive Suggestions (ACTION_BUTTON):**
        - Use this for suggestions when the user's intent is not a direct command.
        - Format: ACTION_BUTTON[Button Text|actionType|value]
        - Valid 'actionType': navigate, prefill.
  `;

  const finalMessages: Message[] = (messages.length > 0 && messages[0].role !== 'system') 
    ? [{ role: 'system', content: systemPrompt, id: 'system-prompt' }, ...messages]
    : messages.map((m: Message, index: number) => 
        (m.role === 'system' && index === 0) ? { ...m, content: systemPrompt } : m
      );

  const openAIFormattedMessages = finalMessages
    .filter((m: Message) => m.content)
    .map((m: Message) => ({
      role: m.role,
      content: m.content,
    }));

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: openAIFormattedMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.5,
    });

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("Chatbot API: DETAILED OPENAI ERROR:", error);
    return new Response(JSON.stringify({ 
        error: "An error occurred with the AI service.", 
        details: error.message 
    }), { status: 500 });
  }
}
