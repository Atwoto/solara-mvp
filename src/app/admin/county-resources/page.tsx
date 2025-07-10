// src/app/admin/county-resources/page.tsx
import { supabaseAdmin } from '@/lib/supabase/server'; // <-- UPDATED: Use the admin client
import { CountyResource } from '@/types';
import ResourceClientPage from './ResourceClientPage';

export const dynamic = 'force-dynamic';

const AdminCountyResourcesPage = async () => {
  // --- THIS IS THE FIX ---
  // We now use 'supabaseAdmin' which has full permissions to read all data,
  // bypassing any Row Level Security policies that might block the view.
  const { data, error } = await supabaseAdmin
    .from('county_resources')
    .select('*')
    .order('county_name', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching county resources:', error);
    return <div className="p-8 text-red-500">Error loading resources. Please check the server logs.</div>;
  }

  const resources: CountyResource[] = data || [];

  // Pass the fetched data to the client component, which remains unchanged.
  return <ResourceClientPage initialResources={resources} />;
};

export default AdminCountyResourcesPage;
