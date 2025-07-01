// src/app/admin/services/edit/[serviceId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ServicePageData } from '@/types'; 
import ServiceForm from '@/components/admin/ServiceForm'; // Re-use the same form component
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

const EditServicePage = () => {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.serviceId as string | undefined;

  const { data: session, status: sessionStatus } = useSession();
  
  const [initialServiceData, setInitialServiceData] = useState<ServicePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Security & Data Fetching
  useEffect(() => {
    if (sessionStatus === 'loading') return; 
    if (sessionStatus === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/services/edit/${serviceId}`); return;
    }
    if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/'); return;
    }

    if (sessionStatus === 'authenticated' && serviceId) {
      const fetchServiceData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/services/${serviceId}`);
          if (!response.ok) {
            const errData = await response.json();
            if (response.status === 404) throw new Error('Service not found.');
            throw new Error(errData.message || 'Failed to fetch service data');
          }
          const data: ServicePageData = await response.json();
          setInitialServiceData(data);
        } catch (err: any) {
          setError(err.message);
          console.error("Error fetching service for edit:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchServiceData();
    } else if (!serviceId && sessionStatus === 'authenticated') {
        setError("Service ID is missing.");
        setIsLoading(false);
    }
  }, [serviceId, session, sessionStatus, router]);

  if (isLoading || sessionStatus === 'loading') {
    return <div className="p-6"><PageLoader message="Loading service details..." /></div>;
  }

  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
     return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>;
  }

  if (error) {
    return (
        <div className="p-6">
            <PageHeader title="Error" description={error} showBackButton={true} backButtonHref="/admin/services" />
        </div>
    );
  }
  
  if (!initialServiceData) {
     return (
        <div className="p-6">
            <PageHeader title="Not Found" description="The requested service could not be found." showBackButton={true} backButtonHref="/admin/services" />
        </div>
     );
  }

  return (
    // AdminLayout is applied by src/app/admin/layout.tsx
    <>
      <PageHeader
        title="Edit Service"
        description={`Updating: ${initialServiceData.title}`}
        showBackButton={true}
        backButtonHref="/admin/services"
      />
      <div className="mt-6 max-w-3xl mx-auto">
        <ServiceForm 
          initialData={initialServiceData} 
          // Optional: Define an onSubmitSuccess if you want custom behavior after update
          // onSubmitSuccess={() => router.push('/admin/services')} 
        />
      </div>
    </>
  );
};

export default EditServicePage;