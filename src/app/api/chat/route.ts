// src/app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { Product as ProductTypeFromTypes, ServicePageData, BlogPost } from '@/types';
import type { Message } from 'ai'; 

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
  
  const dbClient = supabaseAdmin || supabase; 

  let productKnowledge = 'No product information available.';
  let serviceKnowledge = 'No installation service information available.';
  let articleKnowledge = 'No blog article information available.';

  try {
    const [productsRes, servicesRes, articlesRes] = await Promise.all([
        dbClient.from('products').select('id, name, price, wattage, category, description'),
        dbClient.from('service_pages').select('id, title, slug, excerpt, content_html').eq('status', 'published'),
        dbClient.from('articles').select('id, title, slug, excerpt, category').filter('published_at', 'lte', new Date().toISOString())
    ]);

    // --- THE FIX IS HERE ---
    // We explicitly type 'p' as the Product type you imported.
    if (productsRes.data && productsRes.data.length > 0) {
      productKnowledge = productsRes.data.map((p: ProductTypeFromTypes) => 
        `\n- Product ID: ${p.id}, Name: "${p.name}", Category: "${p.category}", Price: Ksh ${p.price}, Wattage: ${p.wattage || 'N/A'}${p.wattage ? 'W' : ''}, Description: "${p.description}"`
      ).join('');
    }
    if(productsRes.error) console.error("Chatbot API Error fetching products:", productsRes.error.message);

    // It's good practice to type the others as well for consistency.
    if (servicesRes.data && servicesRes.data.length > 0) {
      serviceKnowledge = servicesRes.data.map((s: ServicePageData) => 
        `\n- Service: "${s.title}", Summary: "${stripHtml(s.excerpt)}", Details: "${stripHtml(s.content_html).substring(0, 200)}..."`
      ).join('');
    }
    if(servicesRes.error) console.error("Chatbot API Error fetching services:", servicesRes.error.message);

    if (articlesRes.data && articlesRes.data.length > 0) {
      articleKnowledge = articlesRes.data.map((a: BlogPost) => 
        `\n- Article: "${a.title}", Category: "${a.category}", Summary: "${stripHtml(a.excerpt)}"`
      ).join('');
    }
    if(articlesRes.error) console.error("Chatbot API Error fetching articles:", articlesRes.error.message);

  } catch (e: any) {
    console.error("Chatbot API: Critical error fetching knowledge base:", e.message);
  }
  
  // --- The rest of your file is perfectly fine, no changes needed below ---
  let cartKnowledge = 'The user\'s shopping cart is currently empty.';
  if (cart && cart.length > 0) {
    cartKnowledge = 'The user\'s shopping cart currently contains:' + cart.map(
      (item) => `\n- ${item.quantity}x "${item.name}" (ID: ${item.id})`
    ).join('');
  }

  let wishlistKnowledge = 'The user\'s wishlist is currently empty.';
  if (wishlist && wishlist.length > 0) {
    try {
        const { data: wishlistProducts, error: wishlistError } = await dbClient
            .from('products')
            .select('id, name')
            .in('id', wishlist);
        
        if (wishlistError) {
            console.error("Chatbot API: Error fetching wishlist product names:", wishlistError.message);
            wishlistKnowledge = `The user has ${wishlist.length} item(s) on their wishlist, but I couldn't retrieve the names.`;
        } else if (wishlistProducts && wishlistProducts.length > 0) {
            wishlistKnowledge = 'The user\'s wishlist currently contains:' + wishlistProducts.map(
                (p: { id: string, name: string }) => `\n- "${p.name}" (ID: ${p.id})`
            ).join('');
        }
    } catch(e: any) {
        console.error("Chatbot API: Error processing wishlist:", e.message);
        wishlistKnowledge = 'There was an error retrieving details for the wishlist items.';
    }
  }

  const systemPrompt = `
    Your Identity: You are the "Bills On Solar Assistant", a friendly, expert AI from Bills On Solar EA Limited in Kenya.
    Your Goal: Provide accurate, helpful answers based ONLY on the information provided to you in the knowledge base below. You can also manage the user's cart and wishlist.
    --- KNOWLEDGE BASE ---
    1.  **About Our Company (Bills On Solar EA Limited):**
        - We are a leading renewable energy company based in Nairobi, Kenya.
        - With over a decade of experience, we are committed to delivering reliable, affordable, and sustainable solar power solutions.
        - We cater to a diverse clientele, from residential homes seeking energy independence to large commercial enterprises aiming to optimize operational costs.
    2.  **Our Projects and Experience:**
        - We have successfully completed over 500 projects across Kenya.
        - Our total installed capacity exceeds 180kW.
        - Our project expertise includes residential solar hybrid systems, power backup systems, large-scale commercial and industrial solar solutions, and specialized solar water pump installations.
    3.  **Available Products:**
        ${productKnowledge}
    4.  **Installation Services Offered:**
        ${serviceKnowledge}
    5.  **Available Blog Articles:**
        ${articleKnowledge}
    6.  **Current User's Shopping Cart:**
        ${cartKnowledge}
    7.  **Current User's Wishlist:**
        ${wishlistKnowledge}
    --- END KNOWLEDGE BASE ---
    --- IMPORTANT RULES ---
    1.  **Strictly Use Knowledge Base**: When asked about the company, projects, products, services, or articles, you MUST base your answer on the information provided in the KNOWLEDGE BASE above. If the information is not present, you must state that you don't have that specific information. Do not invent information.
    2.  **Answering Specific Questions**:
        - If asked "what do you do?" or "about your company", use the "About Our Company" section.
        - If asked about "projects" or "experience", use the "Our Projects and Experience" section.
        - If asked about specific articles, summarize them from the "Available Blog Articles" section.
    3.  **Action Execution (EXECUTE_ACTION command)**: When a user gives a clear command like "add/remove [product name]", find the product ID from the knowledge base and use the EXECUTE_ACTION[action_type|product_id] command on a new line after your natural language response. The 'action_type' MUST be camelCase (e.g., addToCart, removeFromWishlist).
    4.  **Suggestive Buttons (ACTION_BUTTON command)**: Only use this for proactive suggestions.
    5.  **Privacy**: You are given the user's cart/wishlist contents for this conversation turn only. You can answer questions about it and act on it, but do not state this in a surprising way. Just answer as if you naturally have the context.
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