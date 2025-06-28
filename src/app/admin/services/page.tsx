'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader'; 
import ServicesTable from '@/components/admin/ServicesTable';
import { ServicePageData } from '@/types';
import PageLoader from '@/components/PageLoader';    
import { PlusIcon } from '@heroicons/react/24/outline';
// --- NEW: Import our master list of services ---
import { serviceOptions } from '@/lib/serviceOptions';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com'; 

// --- NEW: Define a type for our unified list ---
export type ManagedService = {
  isCreated: boolean; // Does this service exist in the DB?
  label: string; // The human-readable name (e.g., "Water Pump Installation")
  slug: string; // The unique identifier (e.g., "water-pump-installation")
  dbData?: ServicePageData; // The actual data from the database, if it exists
};

const AdminServicesPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  // --- NEW: State to hold our unified list ---
  const [managedServices, setManagedServices] = useState<ManagedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAndProcessServices = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // 1. Fetch existing services from the database
      const response = await fetch('/api/admin/services'); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch existing services');
      }
      const existingServices: ServicePageData[] = await response.json();
      const existingSlugs = new Map(existingServices.map(s => [s.slug, s]));

      // 2. Create the unified list by mapping over our master list
      const allServices: ManagedService[] = serviceOptions.map(option => {
        const dbData = existingSlugs.get(option.value);
        return {
          isCreated: !!dbData,
          label: option.label,
          slug: option.value,
          dbData: dbData, // Will be undefined if not created
        };
      });

      setManagedServices(allServices);

    } catch (error: any) {
      setFetchError(error.message || 'Could not load services.');
      console.error("Error processing services:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      fetchAndProcessServices();
    }
  }, [sessionStatus, session, fetchAndProcessServices]); 

  useEffect(() => {
    if (sessionStatus === 'loading') return; 
    if (sessionStatus === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/admin/services`);
    } else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      router.replace('/'); 
    }
  }, [session, sessionStatus, router]);

  if (sessionStatus === 'loading' || isLoading) {
    return <div className="p-6"><PageLoader message="Loading service management..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    <>
      <PageHeader 
        title="Manage Services"
        description="View all available services and their status. Create new pages or edit existing ones."
      >
        {/* The "Add New" button is still useful for services not in the master list */}
        <Link href="/admin/services/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Custom Service
        </Link>
      </PageHeader>
      
      {fetchError && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{fetchError}</p>}

      <div className="mt-6">
        {/* Pass the new unified list and the refresh function to the table */}
        <ServicesTable services={managedServices} onRefresh={fetchAndProcessServices} /> 
      </div>
    </>
  );
};

export default AdminServicesPage;