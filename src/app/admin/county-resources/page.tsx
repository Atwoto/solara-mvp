// src/app/admin/county-resources/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CountyResource } from '@/types';
import ResourceClientPage from './ResourceClientPage';

// This forces the page to be dynamically rendered, ensuring you always see the latest data.
export const dynamic = 'force-dynamic';

const AdminCountyResourcesPage = async () => {
  const supabase = createServerComponentClient({ cookies });

  // Fetch all resources from the database, ordered by county name.
  const { data, error } = await supabase
    .from('county_resources')
    .select('*')
    .order('county_name', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching county resources:', error);
    // Render a more user-friendly error message
    return <div className="p-8 text-red-500">Error loading resources. Please check the server logs.</div>;
  }

  const resources: CountyResource[] = data || [];

  // Pass the fetched data to the client component that will handle the UI and interactions.
  return <ResourceClientPage initialResources={resources} />;
};

export default AdminCountyResourcesPage;
