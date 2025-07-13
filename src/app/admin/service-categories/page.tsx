// src/app/admin/service-categories/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ServiceCategory } from '@/types';
import PageHeader from '@/components/admin/PageHeader';
import ServiceCategoryClientPage from './ServiceCategoryClientPage';
import { redirect } from 'next/navigation';
import { Session, getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com'; // Hardcoded for reliability

export default async function AdminServiceCategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  const session = await getServerSession(authOptions) as Session | null;

  // Security Check: Redirect if not the admin
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect('/'); // Or to a dedicated 'unauthorized' page
  }

  // Fetching data using the standard client, which should work if RLS policies are correct.
  // If this fails, it indicates a policy issue on the 'service_categories' table itself.
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching service categories:", error);
    return <div className="p-8 text-red-500">Error loading categories. Please ensure you have set the correct RLS policies for the 'service_categories' table to allow read access for authenticated users.</div>;
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
