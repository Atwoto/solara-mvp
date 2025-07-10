// src/app/api/service-categories/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';

// Define the structure of the navigation items, including potential children
interface NavCategory extends ServiceCategory {
  href: string;
  subcategories?: NavCategory[];
}

// This function takes a flat list of categories from the database
// and builds a nested (hierarchical) tree structure.
const buildCategoryTree = (categories: ServiceCategory[]): NavCategory[] => {
  const categoryMap = new Map<string, NavCategory>();
  const tree: NavCategory[] = [];

  // First, map each category by its ID and add a 'subcategories' array and 'href'
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      href: `/services/${category.slug}`, // Construct the link
      subcategories: [],
    });
  });

  // Then, build the tree by linking children to their parents
  categoryMap.forEach(category => {
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      const parent = categoryMap.get(category.parent_id);
      parent?.subcategories?.push(category);
    } else {
      // If a category has no parent, it's a top-level item
      tree.push(category);
    }
  });

  return tree;
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true })
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
