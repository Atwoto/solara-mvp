// src/app/api/service-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';

// Add this to force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NavCategory extends ServiceCategory {
  href: string;
  subcategories?: NavCategory[];
}

const buildCategoryTree = (categories: ServiceCategory[]): NavCategory[] => {
  const categoryMap = new Map<string, NavCategory>();
  
  // First pass: Create all categories with href and empty subcategories
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      href: `/services/${category.slug}`,
      subcategories: [],
    });
  });

  const tree: NavCategory[] = [];

  // Second pass: Build the tree structure
  categories.forEach(category => {
    const navCategory = categoryMap.get(category.id);
    if (!navCategory) return;

    if (category.parent_id && categoryMap.has(category.parent_id)) {
      // This is a sub-category
      const parent = categoryMap.get(category.parent_id);
      if (parent?.subcategories) {
        parent.subcategories.push(navCategory);
      }
    } else {
      // This is a top-level category
      tree.push(navCategory);
    }
  });

  // Sort subcategories within each parent
  categoryMap.forEach(parent => {
    if (parent.subcategories && parent.subcategories.length > 0) {
      parent.subcategories.sort((a, b) => a.display_order - b.display_order);
    }
  });

  // Sort top-level categories
  tree.sort((a, b) => a.display_order - b.display_order);

  console.log('Built category tree:', tree.length, 'top-level categories');
  return tree;
};

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching service categories...');
    
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Raw categories from DB:', data?.length || 0);
    
    const categoryTree = buildCategoryTree(data || []);
    
    // Add cache-control headers to prevent caching
    const response = NextResponse.json(categoryTree);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}