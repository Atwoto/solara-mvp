// src/app/admin/service-categories/page.tsx
import { supabaseAdmin } from '@/lib/supabase/server';
import { ServiceCategory } from '@/types';
import PageHeader from '@/components/admin/PageHeader';
import ServiceCategoryClientPage from './ServiceCategoryClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminServiceCategoriesPage() {
  const { data, error } = await supabaseAdmin
    .from('service_categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching service categories:", error);
    return <div className="p-8 text-red-500">Error loading categories.</div>;
  }

  const categories: ServiceCategory[] = data || [];

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Manage Service Categories"
        description="Add, edit, and organize the service categories for the main navigation menu."
      />
      <ServiceCategoryClientPage initialCategories={categories} />
    </div>
  );
}
