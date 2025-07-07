// src/app/admin/subscribers/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import SubscribersClient from './SubscribersClient';
// The import for '@/types/supabase' is removed.

export const dynamic = 'force-dynamic';

const SubscribersPage = async () => {
  // We remove the <Database> generic type here.
  const supabase = createServerComponentClient({ cookies });

  // Fetch all subscribers from the 'subscribers' table, ordered by the newest first.
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscribers:', error);
    return <div>Error loading subscribers. Please check the server logs.</div>;
  }

  // Pass the fetched data to the client component for rendering the table.
  return <SubscribersClient subscribers={subscribers || []} />;
};

export default SubscribersPage;
