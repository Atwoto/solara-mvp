// src/app/api/service-categories/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';

interface NavCategory extends ServiceCategory {
  href: string;
  subcategories?: NavCategory[];
}

const buildCategoryTree = (categories: ServiceCategory[]): NavCategory[] => {
  const nodeMap = new Map<string, NavCategory>();

  categories.forEach(cat => {
    nodeMap.set(cat.id, {
      ...cat,
      href: `/services/${cat.slug}`,
      subcategories: [],
    });
  });

  const tree: NavCategory[] = [];

  nodeMap.forEach(node => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      const parentNode = nodeMap.get(node.parent_id)!;
      parentNode.subcategories?.push(node);
    } else {
      tree.push(node);
    }
  });

  const sortChildren = (node: NavCategory) => {
    if (node.subcategories && node.subcategories.length > 0) {
      node.subcategories.sort((a, b) => a.display_order - b.display_order);
      node.subcategories.forEach(sortChildren);
    }
  };

  tree.forEach(sortChildren);
  tree.sort((a, b) => a.display_order - b.display_order);

  return tree;
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*');

    if (error) {
      console.error("Error fetching service categories from DB:", error.message);
      throw error;
    }

    const categoryTree = buildCategoryTree(data || []);
    return NextResponse.json(categoryTree);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}