// /src/app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import type { Message } from "ai";

import { supabaseAdmin } from "@/lib/supabase/server";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OpenRouter API key.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "X-Title": "Bills On Solar Assistant",
  },
});

export const runtime = "edge";

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s\s+/g, " ")
    .trim();
};

export async function POST(req: Request) {
  const {
    messages,
    cart,
    wishlist,
    isLoggedIn,
    userName,
  }: {
    messages: Message[];
    cart: { id: string; name: string; quantity: number }[];
    wishlist: string[];
    isLoggedIn: boolean;
    userName: string | null;
  } = await req.json();

  const dbClient = supabaseAdmin;

  let productKnowledge = "No product information available.";
  let servicePageKnowledge = "No installation service page content available.";
  let articleKnowledge = "No blog article information available.";
  let projectKnowledge = "No project information available.";
  let serviceCategoryKnowledge = "No service categories defined.";
  // --- THIS IS THE FIX ---
  // Added a new variable for county resources
  let countyResourceKnowledge = "No county-specific resources available.";

  try {
    // --- THIS IS THE FIX ---
    // Added 'county_resources' to the data fetching
    const [
      productsRes,
      servicesRes,
      articlesRes,
      projectsRes,
      serviceCategoriesRes,
      countyResourcesRes,
    ] = await Promise.all([
      dbClient
        .from("products")
        .select("id, name, price, wattage, category, description")
        .limit(100),
      dbClient
        .from("service_pages")
        .select("id, title, slug, excerpt")
        .eq("status", "published"),
      dbClient
        .from("articles")
        .select("id, title, slug, excerpt, category")
        .filter("published_at", "lte", new Date().toISOString()),
      dbClient
        .from("projects")
        .select("id, title, category, description")
        .eq("is_published", true),
      dbClient
        .from("service_categories")
        .select("id, name, slug, parent_id")
        .order("display_order"),
      dbClient
        .from("county_resources")
        .select("county_name, file_title, file_description")
        .eq("is_published", true),
    ]);

    if (productsRes.data && productsRes.data.length > 0) {
      productKnowledge = productsRes.data
        .map(
          (p: any) =>
            `\n- Product ID: ${p.id}, Name: "${p.name}", Category: "${p.category}", Price: Ksh ${p.price}`
        )
        .join("");
    }

    if (servicesRes.data && servicesRes.data.length > 0) {
      servicePageKnowledge = servicesRes.data
        .map(
          (s: any) =>
            `\n- Service Page Content: For the service with URL "/services/${s.slug}", the detailed summary is: "${stripHtml(s.excerpt)}"`
        )
        .join("");
    }

    if (articlesRes.data && articlesRes.data.length > 0) {
      articleKnowledge = articlesRes.data
        .map(
          (a: any) =>
            `\n- Article: "${a.title}", URL Slug: "/blog/${a.slug}", Category: "${a.category}"`
        )
        .join("");
    }

    if (projectsRes.data && projectsRes.data.length > 0) {
      projectKnowledge = projectsRes.data
        .map(
          (p: any) =>
            `\n- Project: "${p.title}", Category: "${p.category}", Description: "${p.description}"`
        )
        .join("");
    }

    if (serviceCategoriesRes.data && serviceCategoriesRes.data.length > 0) {
      const categories = serviceCategoriesRes.data;
      const categoryMap = new Map(
        categories.map((cat) => [cat.id, { ...cat, children: [] as any[] }])
      );
      const tree: any[] = [];
      categories.forEach((cat) => {
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          categoryMap
            .get(cat.parent_id)
            ?.children.push(categoryMap.get(cat.id));
        } else {
          tree.push(categoryMap.get(cat.id));
        }
      });

      const buildKnowledgeString = (nodes: any[], level = 0) => {
        let str = "";
        nodes.forEach((node) => {
          str += `\n${"  ".repeat(level)}- Category: "${node.name}", URL: "/services/${node.slug}"`;
          if (node.children.length > 0) {
            str += buildKnowledgeString(node.children, level + 1);
          }
        });
        return str;
      };
      serviceCategoryKnowledge = buildKnowledgeString(tree);
    }

    // --- THIS IS THE FIX ---
    // Process county resource data into knowledge
    if (countyResourcesRes.data && countyResourcesRes.data.length > 0) {
      countyResourceKnowledge = countyResourcesRes.data
        .map(
          (r: any) =>
            `\n- Resource for ${r.county_name} County: "${r.file_title}", Description: "${r.file_description}"`
        )
        .join("");
    }
  } catch (e: any) {
    console.error(
      "Chatbot API: Critical error fetching knowledge base:",
      e.message
    );
  }

  // Cart and Wishlist knowledge remain the same
  let cartKnowledge = "The user's shopping cart is currently empty.";
  if (cart && cart.length > 0) {
    cartKnowledge =
      "The user's shopping cart currently contains:" +
      cart
        .map((item) => `\n- ${item.quantity}x "${item.name}" (ID: ${item.id})`)
        .join("");
  }
  let wishlistKnowledge = "The user's wishlist is currently empty.";
  if (wishlist && wishlist.length > 0) {
    try {
      const { data: wishlistProducts } = await dbClient
        .from("products")
        .select("id, name")
        .in("id", wishlist);
      if (wishlistProducts && wishlistProducts.length > 0) {
        wishlistKnowledge =
          "The user's wishlist currently contains:" +
          wishlistProducts
            .map(
              (p: { id: string; name: string }) =>
                `\n- "${p.name}" (ID: ${p.id})`
            )
            .join("");
      }
    } catch (e) {
      /* Graceful degradation */
    }
  }

  // --- FULLY UPGRADED SYSTEM PROMPT ---
  const systemPrompt = `
    Your Identity: You are the "Bills On Solar Assistant", a friendly, expert AI from Bills On Solar EA Limited in Kenya.
    Your Primary Goal: Assist users by answering their questions and guiding them through the website. You MUST base your answers strictly on the information provided in the KNOWLEDGE BASE.

    --- CONTEXT & KNOWLEDGE BASE ---
    1.  **User's Login Status:** The user is currently ${isLoggedIn ? "LOGGED IN" : "NOT LOGGED IN"}.
    2.  **User's Name:** ${userName ? `The user's name is ${userName}.` : "The user is not logged in, so you do not know their name."}
    3.  **Available Pages for Navigation:**
        - Home Page: "/"
        - All Products Page: "/products"
        - Projects Page: "/projects"
        - County Resources Page: "/county-resources"
        - About Us Page: "/#about-us"
        - Contact Us Page: "/#contact-us"
        - Blog Page: "/blog"
        - Compare Page: "/compare"
        - Wishlist Page: "/wishlist" (Requires login)
        - My Account/Dashboard: "/account" (Requires login)
    4.  **Available Products:** ${productKnowledge}
    5.  **Available Service Categories:** ${serviceCategoryKnowledge}
    6.  **Showcased Projects:** ${projectKnowledge}
    7.  **Downloadable County Resources:** ${countyResourceKnowledge}
    8.  **Available Blog Articles:** ${articleKnowledge}
    
    10. **Current User's Shopping Cart:** ${cartKnowledge}
    11. **Current User's Wishlist:** ${wishlistKnowledge}
    --- END KNOWLEDGE BASE ---

    --- COMMAND & ACTION RULES (VERY IMPORTANT) ---
    1.  **Personalization:** If you know the user's name, greet them warmly.
    2.  **Analyze User Intent:** Understand if the user is asking a question, giving a command, or requesting to go to a page.
    3.  **Answering Questions:** Use ONLY information from the knowledge base. If asked about a service, refer to the "Available Service Categories" first.
    4.  **Automatic Navigation (AUTO_NAVIGATE command):**
        - Before navigating to a page requiring login, check the user's login status. If they are not logged in, tell them they need to log in first and suggest navigating to the login page.
        - Format: AUTO_NAVIGATE[url]
    5.  **Executing Actions (EXECUTE_ACTION):**
        - Use for cart/wishlist actions.
        - Format: EXECUTE_ACTION[actionType|productId_or_empty]
    6.  **Suggesting Actions (ACTION_BUTTON):**
        - Use this for suggestions.
        - Format: ACTION_BUTTON[Button Text|actionType|value]
  `;

  // No changes to the rest of the file
  const finalMessages: Message[] =
    messages.length > 0 && messages[0].role !== "system"
      ? [
          { role: "system", content: systemPrompt, id: "system-prompt" },
          ...messages,
        ]
      : messages.map((m: Message, index: number) =>
          m.role === "system" && index === 0
            ? { ...m, content: systemPrompt }
            : m
        );

  const openAIFormattedMessages = finalMessages
    .filter((m: Message) => m.content)
    .map((m: Message) => ({
      role: m.role,
      content: m.content,
    }));

  try {
    const response = await openai.chat.completions.create({
      model: "openai/chatgpt-4o-latest", // OpenRouter format: provider/model
      stream: true,
      messages:
        openAIFormattedMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.5,
    });

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error("Chatbot API: DETAILED OPENAI ERROR:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred with the AI service.",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
