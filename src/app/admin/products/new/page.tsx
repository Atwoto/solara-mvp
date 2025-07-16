// src/app/admin/products/new/page.tsx
'use client';

import { useEffect } from 'react'; // Only useEffect might be needed for auth guard
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProductForm } from '@/components/admin/ProductForm'; // Import the reusable form
import PageHeader from '@/components/admin/PageHeader'; 
import PageLoader from '@/components/PageLoader';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

const AddNewProductPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Security Guard
  useEffect(() => {
    if (status === 'loading') return; 
    if (status === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/products/new`);
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/'); 
    }
  }, [session, status, router]);
  
  if (status === 'loading') {
    return <div className="p-6"><PageLoader message="Loading page..." /></div>;
  }
  if (status !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    // AdminLayout applied by src/app/admin/layout.tsx
    <>
      <PageHeader 
        title="Add New Product"
        description="Fill in the details to add a new product to the catalog."
        showBackButton={true}
        backButtonHref="/admin/products"
      />
      <div className="mt-6 max-w-2xl mx-auto">
        <ProductForm 
            // No initialData for new product
            onSubmitSuccess={(message) => {
                // Optionally, you could clear the form here or show a more persistent success message
                // For now, the form resets itself on successful creation
                console.log("Product creation success from page:", message);
                // router.push('/admin/products'); // Or navigate after a delay
            }}
        />
      </div>
    </>
  );
};

export default AddNewProductPage;