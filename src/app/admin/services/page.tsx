// src/app/admin/services/page.tsx
'use client'; // This page will fetch data client-side and use hooks

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
// No AdminLayout import here, it's handled by src/app/admin/layout.tsx
import PageHeader from '@/components/admin/PageHeader'; 
import ServicesTable from '@/components/admin/ServicesTable'; // Your table component for services
import { ServicePageData } from '@/types'; // Your type for service data
import PageLoader from '@/components/PageLoader';    
import { PlusIcon } from '@heroicons/react/24/outline'; // For the "Add New" button

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com'; 

// This is the React Component that needs to be default exported
const AdminServicesPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<ServicePageData[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAdminServices = useCallback(async () => {
    setIsLoadingServices(true);
    setFetchError(null);
    try {
      // This API endpoint needs to exist and return all services for admin
      // It should be GET /api/admin/services (using the GET handler you provided in route.ts)
      const response = await fetch('/api/admin/services'); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch services');
      }
      const data: ServicePageData[] = await response.json();
      setServices(data);
    } catch (error: any) {
      setFetchError(error.message || 'Could not load services.');
      console.error("Error fetching services for admin:", error);
    } finally {
      setIsLoadingServices(false);
    }
  }, []); // useCallback with empty dependency array

  // Fetch services when component mounts or session status changes
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      fetchAdminServices();
    }
  }, [sessionStatus, session, fetchAdminServices]); 

  // Page-level security guard
  useEffect(() => {
    if (sessionStatus === 'loading') return; 

    if (sessionStatus === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/admin/services`);
    } else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      router.replace('/'); 
    }
  }, [session, sessionStatus, router]);

  // Let src/app/admin/layout.tsx (which uses AdminLayoutComponent) handle the main loading/auth UI.
  if (sessionStatus === 'loading') {
    return <div className="p-6"><PageLoader message="Loading services page..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    // The <AdminLayout> wrapper is applied by src/app/admin/layout.tsx
    <>
      <PageHeader 
        title="Manage Services"
        description="View, add, edit, or delete installation services."
      >
        <Link href="/admin/services/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Service
        </Link>
      </PageHeader>
      
      {fetchError && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{fetchError}</p>}

      {isLoadingServices && services.length === 0 && (
         <div className="text-center py-10"><PageLoader message="Loading services..." /></div>
      )}

      {!isLoadingServices && services.length === 0 && !fetchError && (
          <div className="text-center py-10 text-gray-500">
            <p>No services found.</p>
            <Link href="/admin/services/new" className="text-solar-flare-start hover:underline mt-2 inline-block">
                Add your first service
            </Link>
          </div>
      )}

      {services.length > 0 && (
        <div className="mt-6">
          {/* You'll pass the fetched services to this table component */}
          <ServicesTable services={services} /> 
        </div>
      )}
    </>
  );
};

export default AdminServicesPage; // THIS IS THE CRUCIAL DEFAULT EXPORT