// src/app/admin/services/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader'; 
import { ServicePageData, ServiceCategory } from '@/types';
import PageLoader from '@/components/PageLoader';    
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { motion, Variants } from 'framer-motion';

// --- THIS IS THE FIX ---
// Hardcoding the admin email to match your other working admin pages.
// Note: Using environment variables is generally more secure, but this will work.
const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com'; 

export type ManagedService = {
  isCreated: boolean;
  label: string;
  slug: string;
  dbData?: ServicePageData;
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// --- SERVICE CARD COMPONENT ---
const ServiceCard = ({ service }: { service: ManagedService }) => {
    const statusConfig = service.isCreated
        ? { text: 'Created', color: 'bg-green-100 text-green-700' }
        : { text: 'Not Created', color: 'bg-slate-100 text-slate-600' };

    const createLink = `/admin/services/new?slug=${encodeURIComponent(service.slug)}&label=${encodeURIComponent(service.label)}`;
    const editLink = `/admin/services/edit/${service.dbData?.id}`;

    return (
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-md text-slate-800">{service.label}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full" >
                        <div className={`h-2 w-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`}></div>
                        <span className={statusConfig.color}>{statusConfig.text}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md mt-2">
                    {service.slug}
                </p>
            </div>
            <div className="mt-4">
                {service.isCreated ? (
                    <Link href={editLink} className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-deep-night hover:bg-slate-800 rounded-lg shadow-sm transition-colors">
                        <PencilSquareIcon className="h-4 w-4 mr-2"/>
                        Edit Page
                    </Link>
                ) : (
                    <Link href={createLink} className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 rounded-lg shadow-sm transition-opacity">
                        <PlusIcon className="h-4 w-4 mr-2"/>
                        Create Page
                    </Link>
                )}
            </div>
        </motion.div>
    );
};


// --- ADMIN SERVICES PAGE ---
const AdminServicesPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [managedServices, setManagedServices] = useState<ManagedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAndProcessServices = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const categoriesResponse = await fetch('/api/admin/service-categories/flat'); 
      if (!categoriesResponse.ok) throw new Error('Failed to fetch service categories');
      const allServiceCategories: ServiceCategory[] = await categoriesResponse.json();
      
      const pagesResponse = await fetch('/api/admin/services'); 
      if (!pagesResponse.ok) throw new Error('Failed to fetch existing service pages');
      const existingServicePages: ServicePageData[] = await pagesResponse.json();
      
      const existingPagesMap = new Map(existingServicePages.map(p => [p.slug, p]));

      const allServices: ManagedService[] = allServiceCategories.map(category => {
        const dbData = existingPagesMap.get(category.slug);
        return {
          isCreated: !!dbData,
          label: category.name,
          slug: category.slug,
          dbData: dbData,
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
    <div className="p-6 sm:p-8">
      <PageHeader 
        title="Manage Services"
        description="View all available services and their status. Create new pages or edit existing ones."
      >
        <Link href="/admin/services/new" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Custom Service
        </Link>
      </PageHeader>
      
      {fetchError && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{fetchError}</p>}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
      >
        {managedServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
        ))}
      </motion.div>
    </div>
  );
};

export default AdminServicesPage;
