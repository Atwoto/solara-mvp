// src/types.ts

// --- PRODUCT RELATED TYPES ---
export interface Product {
  id: string;
  created_at: string;
  name: string;
  price: number;
  wattage?: number | null;
  image_url: string[] | null;
  category?: string | null;
  description?: string | null;
  is_archived?: boolean;
  features?: string[] | { title: string; detail: string }[];
}

// --- THIS IS THE FIX ---
// Added 'solar-lights' and the other missing slugs to this list.
export const PRODUCT_CATEGORY_SLUGS = [
  "solar-panels",
  "off-grid-inverters",
  "hybrid-inverters",
  "grid-tied-inverters",
  "vrla-battery",
  "lithium-ion-battery",
  "portable-power-station",
  "solar-lights",
  "pumps",
  "heat-pumps",
  "pumping-inverter",
  "borehole-pumps",
  "surface-pump",
  "solar-water-heaters",
  "direct-indirect",
  "pressurised-non-pressurised",
  "solar-fridge",
  "residential",
  "commercial",
  "accessories",
] as const;
export type ProductCategorySlug = (typeof PRODUCT_CATEGORY_SLUGS)[number];

// --- CART RELATED TYPES ---
export interface CartItem extends Product {
  quantity: number;
}

// --- BLOG POST RELATED TYPES ---
export interface BlogPost {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  published_at?: string | null;
  category?: BlogPostCategory | string | null;
  image_url?: string | null;
  excerpt?: string | null;
  content: string;
  author_name?: string | null;
  key_takeaways?: string[] | { title: string; detail: string }[];
}
export const BLOG_POST_CATEGORIES = [
  "Solar Basics",
  "Industry News",
  "Product Reviews",
  "DIY Projects",
  "Case Studies",
  "Company Updates",
  "Technology",
  "Business",
  "Investment",
] as const;
export type BlogPostCategory = (typeof BLOG_POST_CATEGORIES)[number];

// --- TESTIMONIAL RELATED TYPES ---
export interface Testimonial {
  id: string;
  created_at: string;
  client_name: string;
  client_title_company?: string | null;
  quote: string;
  rating?: number | null;
  image_url?: string | null;
  is_featured?: boolean | null;
  approved?: boolean | null;
}

// --- ORDER RELATED TYPES ---
export interface ShippingDetails {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
}
export interface Order {
  id: string;
  created_at: string;
  user_id?: string | null;
  user_email?: string | null;
  total_price: number;
  status: string;
  shipping_address: ShippingDetails;
  paystack_reference?: string | null;
  order_items: CartItem[];
}

// --- SERVICE PAGE RELATED TYPES ---
export interface ServicePageData {
  id?: string;
  slug: string;
  title: string;
  parent_service_slug?: string | null;
  status: "draft" | "published" | "archived";
  excerpt?: string | null;
  content_html: string;
  image_urls?: string[] | null;
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

// --- PROJECT RELATED TYPES ---
export const projectCategories = [
  "Residential",
  "Commercial",
  "Industrial",
  "Water Pump Installation",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export interface Project {
  id: string;
  created_at: string;
  title: string;
  description?: string | null;
  category: ProjectCategory;
  type: "image" | "video";
  media_url: string;
  thumbnail_url?: string | null;
  display_order?: number;
  is_published?: boolean;
  highlights?: string[] | { title: string; detail: string }[];
}

// --- SUBSCRIBER RELATED TYPES ---
export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

// --- COUNTY RESOURCE TYPES ---
export interface CountyResource {
  id: string;
  created_at: string;
  county_name: string;
  file_title: string;
  file_description?: string | null;
  file_url: string;
  file_type?: string | null;
  is_published: boolean;
}

// --- DYNAMIC SERVICE CATEGORY TYPES ---
export interface ServiceCategory {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  display_order: number;
}
