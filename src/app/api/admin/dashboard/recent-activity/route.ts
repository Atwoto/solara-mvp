// src/app/api/admin/dashboard/recent-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';
const ACTIVITY_LIMIT = 5; // Number of items to fetch per category

export interface ActivityItem {
  id: string;
  type: 'order' | 'newUser' | 'newProduct' | 'newArticle' | 'newTestimonial';
  timestamp: string; // ISO string for sorting
  title: string;
  description?: string;
  link?: string;
}

// Type definitions for Supabase data
interface OrderData {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string;
  status: string;
  shipping_address?: {
    fullName?: string;
  };
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  display_name?: string;
}

interface ProductData {
  id: string;
  name: string;
  created_at: string;
  category: string;
}

interface ArticleData {
  id: string;
  title: string;
  created_at: string;
  category: string;
  published_at?: string;
}

interface TestimonialData {
  id: string;
  client_name: string;
  created_at: string;
  approved: boolean;
}

// You must have this RPC function in your Supabase SQL Editor for this to work
/*
CREATE OR REPLACE FUNCTION get_recent_users(limit_count INT)
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMPTZ, display_name TEXT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, email, created_at, raw_user_meta_data->>'full_name' as display_name
  FROM auth.users ORDER BY created_at DESC LIMIT limit_count;
$$;
GRANT EXECUTE ON FUNCTION get_recent_users(INT) TO service_role;
*/

export async function GET(request: NextRequest) {
  console.log("API: GET /api/admin/dashboard/recent-activity hit");
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    let allActivities: ActivityItem[] = [];

    // Fetch all data sources concurrently for better performance
    const [ordersRes, usersRes, productsRes, articlesRes, testimonialsRes] = await Promise.all([
      supabaseAdmin.from('orders').select('id, created_at, total_amount, user_id, status, shipping_address').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT),
      supabaseAdmin.rpc('get_recent_users', { limit_count: ACTIVITY_LIMIT }),
      supabaseAdmin.from('products').select('id, name, created_at, category').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT),
      supabaseAdmin.from('articles').select('id, title, created_at, category, published_at').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT),
      supabaseAdmin.from('testimonials').select('id, client_name, created_at, approved').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT)
    ]);
    
    // Process recent orders
    if (ordersRes.error) console.error("Error fetching recent orders:", ordersRes.error.message);
    if (ordersRes.data) {
      allActivities.push(...(ordersRes.data as OrderData[]).map(order => ({
        id: String(order.id),
        type: 'order' as const,
        timestamp: String(order.created_at),
        title: `Order #${String(order.id).substring(0,8)} placed`,
        description: `Status: ${order.status}, Total: Ksh ${order.total_amount.toLocaleString()}. By: ${order.shipping_address?.fullName || 'Guest'}`,
        link: `/admin/orders/${order.id}`,
      })));
    }

    // Process recent new users
    if (usersRes.error) console.error("Error fetching recent users:", usersRes.error.message);
    if (usersRes.data) {
      allActivities.push(...(usersRes.data as UserData[]).map((user) => ({
        id: String(user.id),
        type: 'newUser' as const,
        timestamp: String(user.created_at),
        title: `New user registered`,
        description: `${user.display_name || user.email}`,
        link: `/admin/users/${user.id}`, // If you have a user management page
      })));
    }

    // Process recent products
    if (productsRes.error) console.error("Error fetching recent products:", productsRes.error.message);
    if (productsRes.data) {
      allActivities.push(...(productsRes.data as ProductData[]).map(product => ({
        id: String(product.id),
        type: 'newProduct' as const,
        timestamp: String(product.created_at),
        title: `Product added: ${product.name}`,
        description: `Category: ${product.category}`,
        link: `/admin/products/edit/${product.id}`,
      })));
    }
    
    // Process recent articles
    if (articlesRes.error) console.error("Error fetching recent articles:", articlesRes.error.message);
    if (articlesRes.data) {
      allActivities.push(...(articlesRes.data as ArticleData[]).map(article => ({
        id: String(article.id),
        type: 'newArticle' as const,
        timestamp: String(article.created_at),
        title: `Article created: ${article.title}`,
        description: `Category: ${article.category}, Status: ${article.published_at ? 'Published/Scheduled' : 'Draft'}`,
        link: `/admin/blog/edit/${article.id}`,
      })));
    }

    // Process recent testimonials
    if (testimonialsRes.error) console.error("Error fetching recent testimonials:", testimonialsRes.error.message);
    if (testimonialsRes.data) {
      allActivities.push(...(testimonialsRes.data as TestimonialData[]).map(testimonial => ({
        id: String(testimonial.id),
        type: 'newTestimonial' as const,
        timestamp: String(testimonial.created_at),
        title: `Testimonial from: ${testimonial.client_name}`,
        description: `Status: ${testimonial.approved ? 'Approved' : 'Pending Approval'}`,
        link: `/admin/testimonials`,
      })));
    }

    // Sort all activities by timestamp descending and take the latest N (e.g., 10 overall)
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = allActivities.slice(0, 10);

    return NextResponse.json(recentActivities);

  } catch (error: any) {
    console.error('API: Error fetching recent activity:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch recent activity', error: error.message }, { status: 500 });
  }
}