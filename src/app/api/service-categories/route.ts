// src/app/api/service-categories/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';

// Define the structure of the navigation items, including potential children
interface NavCategory extends ServiceCategory {
  href: string;
  subcategories?: NavCategory[];
}

// --- THIS IS THE CORRECTED FUNCTION ---
// This function now correctly builds a nested tree from a flat list of categories
const buildCategoryTree = (categories: ServiceCategory[]): NavCategory[] => {
  const categoryMap = new Map<string, NavCategory>();
  
  // First, map each category by its ID and add the href and an empty subcategories array
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      href: `/services/${category.slug}`,
      subcategories: [],
    });
  });

  const tree: NavCategory[] = [];

  // Now, iterate again to place each category under its parent
  categoryMap.forEach(category => {
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      // This is a sub-category, push it to its parent's subcategories array
      const parent = categoryMap.get(category.parent_id);
      parent?.subcategories?.push(category);
    } else {
      // This is a top-level category
      tree.push(category);
    }
  });

  // Sort children within each parent based on display_order
  categoryMap.forEach(parent => {
    if (parent.subcategories && parent.subcategories.length > 0) {
        parent.subcategories.sort((a, b) => a.display_order - b.display_order);
    }
  });

  // Finally, sort the top-level categories
  tree.sort((a,b) => a.display_order - b.display_order);

  return tree;
};


export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      // We don't need to order here anymore, the function handles it
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const categoryTree = buildCategoryTree(data || []);
    return NextResponse.json(categoryTree);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
