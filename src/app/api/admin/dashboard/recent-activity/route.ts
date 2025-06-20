
// src/app/api/admin/dashboard/recent-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // <<--- CORRECTED IMPORT PATH
import type { Session } from 'next-auth';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
const ACTIVITY_LIMIT = 5;

export interface ActivityItem  {
  id: string;
  type: 'order' | 'newUser' | 'newProduct' | 'newArticle' | 'newTestimonial';
  timestamp: string; // ISO string for sorting
  title: string;
  description?: string;
  link?: string; // Optional link to the item in admin or public site
}
 // Keep your interface here

/*
  SQL Function this route depends on:
  CREATE OR REPLACE FUNCTION get_recent_users(limit_count INT)
  RETURNS TABLE(...) ...
*/

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    let allActivities: ActivityItem[] = [];

    // Fetch recent orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders').select('id, created_at, total_price, user_id, status, shipping_address').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT);
    if (ordersError) console.error("Error fetching recent orders:", ordersError.message);
      if (orders) {
      allActivities = allActivities.concat(
        orders.map(order => ({
          id: order.id,
          type: 'order',
          timestamp: order.created_at,
          title: `Order #${order.id.substring(0,8)} placed`,
          description: `Status: ${order.status}, Total: Ksh ${order.total_price.toLocaleString()}. Customer: ${order.shipping_address?.fullName || order.user_id?.substring(0,8) || 'Guest'}`,
          link: `/admin/orders/${order.id}`, // Link to admin order detail page
        }))
      );
    }

    // Fetch recent new users
    const { data: newUsers, error: usersError } = await supabaseAdmin.rpc('get_recent_users', { limit_count: ACTIVITY_LIMIT });
    if (usersError) console.error("Error fetching recent users:", usersError.message);
      if (newUsers) {
      allActivities = allActivities.concat(
        newUsers.map((user: any) => ({ // Add 'any' type for RPC result flexibility
          id: user.id,
          type: 'newUser',
          timestamp: user.created_at,
          title: `New user registered: ${user.display_name || user.email}`,
          description: `Email: ${user.email}`,
          // link: `/admin/users/${user.id}` // If you have a user management page
        }))
      );
    

    // Fetch recent products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products').select('id, name, created_at, category').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT);
    if (productsError) console.error("Error fetching recent products:", productsError.message);
    if (products) {
      allActivities = allActivities.concat(
        products.map(product => ({
          id: product.id,
          type: 'newProduct',
          timestamp: product.created_at,
          title: `Product added: ${product.name}`,
          description: `Category: ${product.category}`,
          link: `/admin/products/edit/${product.id}`,
        }))
      );
    }
    
    // Fetch recent articles
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('articles').select('id, title, created_at, category, published_at').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT);
    if (articlesError) console.error("Error fetching recent articles:", articlesError.message);
    if (articles) {
      allActivities = allActivities.concat(
        articles.map(article => ({
          id: article.id,
          type: 'newArticle',
          timestamp: article.created_at,
          title: `Article created: ${article.title}`,
          description: `Category: ${article.category}, Status: ${article.published_at ? 'Published/Scheduled' : 'Draft'}`,
          link: `/admin/blog/edit/${article.id}`,
        }))
      );
    }

    // Fetch recent testimonials
    const { data: testimonials, error: testimonialsError } = await supabaseAdmin
      .from('testimonials').select('id, client_name, created_at, approved').order('created_at', { ascending: false }).limit(ACTIVITY_LIMIT);
    if (testimonialsError) console.error("Error fetching recent testimonials:", testimonialsError.message);
     if (testimonials) {
      allActivities = allActivities.concat(
        testimonials.map(testimonial => ({
          id: testimonial.id,
          type: 'newTestimonial',
          timestamp: testimonial.created_at,
          title: `Testimonial from: ${testimonial.client_name}`,
          description: `Status: ${testimonial.approved ? 'Approved' : 'Pending Approval'}`,
          link: `/admin/testimonials`, // Link to testimonials management
        }))
      );
    }

    // Sort all activities and return
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = allActivities.slice(0, 10); 
    return NextResponse.json(recentActivities);

  } catch (error: any) {
    console.error('API: Error fetching recent activity:', error.message, error.stack);
    return NextResponse.json({ message: 'Failed to fetch recent activity', error: error.message }, { status: 500 });
  }
}