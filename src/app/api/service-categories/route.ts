// src/app/api/service-categories/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';

// Define the structure of the navigation items, including potential children
interface NavCategory extends ServiceCategory {
  href: string;
  subcategories?: NavCategory[];
}

// --- THIS IS THE NEW, MORE ROBUST FUNCTION ---
// It correctly builds a nested tree from a flat list of categories.
const buildCategoryTree = (categories: ServiceCategory[]): NavCategory[] => {
  const nodeMap = new Map<string, NavCategory>();

  // First pass: create a node for each category and add it to the map.
  categories.forEach(cat => {
    nodeMap.set(cat.id, {
      ...cat,
      href: `/services/${cat.slug}`,
      subcategories: [], // Initialize children array
    });
  });

  const tree: NavCategory[] = [];

  // Second pass: link children to their parents.
  nodeMap.forEach(node => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      // It's a sub-category, so find its parent and push it into the parent's 'subcategories' array.
      const parentNode = nodeMap.get(node.parent_id)!;
      parentNode.subcategories?.push(node);
    } else {
      // It's a top-level category (no parent), so add it directly to the final tree.
      tree.push(node);
    }
  });
  
  // Helper function to sort all levels of the tree by 'display_order'
  const sortNodesRecursively = (nodes: NavCategory[]) => {
    nodes.sort((a, b) => a.display_order - b.display_order);
    nodes.forEach(node => {
        if (node.subcategories && node.subcategories.length > 0) {
            sortNodesRecursively(node.subcategories);
        }
    });
  };

  sortNodesRecursively(tree);

  return tree;
};


export async function GET() {
  try {
    // We can fetch all items and sort them reliably in our function.
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
