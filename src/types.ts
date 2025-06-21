// src/types.ts



// --- PRODUCT RELATED TYPES ---
export interface Product {
  id: string;                 
  created_at: string;
  name: string;
  price: number;
  wattage?: number | null;     
  
   image_url: string | null; // <-- Add this line
  category?: string | null; 
  description?: string | null; 
}

export const PRODUCT_CATEGORY_SLUGS = [
  "solar-panels", "off-grid-inverters", "hybrid-inverters", "grid-tied-inverters",
  "vrla-battery", "lithium-ion-battery", "portable-power-station",
  "residential", "commercial", "accessories",
] as const;
export type ProductCategorySlug = typeof PRODUCT_CATEGORY_SLUGS[number];

// --- CART RELATED TYPES ---
export interface CartItem extends Product {
  quantity: number;
}

// --- BLOG POST RELATED TYPES ---
export interface BlogPost { 
  id: string; created_at: string; title: string; slug: string; 
  published_at?: string | null; category?: BlogPostCategory | string | null;
  imageUrl?: string | null; excerpt?: string | null; content: string; 
  author_name?: string | null; 
}
export const BLOG_POST_CATEGORIES = [
  "Solar Basics", "Industry News", "Product Reviews", "DIY Projects",
  "Case Studies", "Company Updates", "Technology", "Business", "Investment"
] as const;
export type BlogPostCategory = typeof BLOG_POST_CATEGORIES[number];

// --- TESTIMONIAL RELATED TYPES ---
export interface Testimonial {
  id: string; created_at: string; client_name: string;
  client_title_company?: string | null; quote: string; rating?: number | null; 
   image_url?: string | null; is_featured?: boolean | null; approved?: boolean | null; 
}

// --- ORDER RELATED TYPES ---
export interface ShippingDetails {
    fullName: string; email?: string; phone: string; address: string;
}
export interface Order {
    id: string; created_at: string; user_id?: string | null; total_price: number;
    status: string; shipping_address: ShippingDetails; paystack_reference?: string | null;
    order_items: CartItem[];
}

// --- SERVICE PAGE RELATED TYPES --- <--- MAKE SURE THIS IS PRESENT AND EXPORTED
export interface ServicePageData { 
  id?: string; 
  slug: string;
  title: string;
  parent_service_slug?: string | null;
  status: 'draft' | 'published' | 'archived';
  excerpt?: string | null;
  content_html: string; 
  hero_image_url?: string | null;
  icon_svg?: string | null; 
  meta_title?: string | null;
  meta_description?: string | null;
  features?: string[] | { title: string; detail: string }[]; 
  call_to_action_label?: string | null;
  call_to_action_link?: string | null;
  display_order?: number;
  created_at?: string; 
  updated_at?: string; 
}