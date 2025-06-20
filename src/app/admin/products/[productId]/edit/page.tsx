// src/app/admin/products/edit/[productId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product } from '@/types'; 
import ProductForm from '@/components/admin/ProductForm'; // Re-use the form
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  // Ensure productId is treated as string or undefined correctly
  const productId = typeof params?.productId === 'string' ? params.productId : undefined;

  const { data: session, status: sessionStatus } = useSession();
  
  const [initialProductData, setInitialProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For loading the product data
  const [error, setError] = useState<string | null>(null);

  // Security Guard & Data Fetching
  useEffect(() => {
    if (sessionStatus === 'loading') {
        // Still loading session, don't do anything yet for fetching
        return; 
    }
    if (sessionStatus === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/products/edit/${productId || ''}`); 
        return;
    }
    if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/'); 
        return;
    }

    // Proceed to fetch data if authenticated as admin and productId is present
    if (sessionStatus === 'authenticated' && session.user.email === ADMIN_EMAIL && productId) {
      const fetchProductData = async () => {
        setIsLoading(true); // Start loading product data
        setError(null);
        try {
          // API endpoint to fetch a single product by ID
          const response = await fetch(`/api/admin/products/${productId}`); 
          if (!response.ok) {
            const errData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            if (response.status === 404) throw new Error('Product not found.');
            throw new Error(errData.message || `Failed to fetch product data (status: ${response.status})`);
          }
          const data: Product = await response.json();
          setInitialProductData(data);
        } catch (err: any) {
          setError(err.message);
          console.error("Error fetching product for edit:", err);
        } finally {
          setIsLoading(false); // Finish loading product data
        }
      };
      fetchProductData();
    } else if (!productId && sessionStatus === 'authenticated' && session.user.email === ADMIN_EMAIL) {
        setError("Product ID is missing in the URL.");
        setIsLoading(false); // Stop loading as there's no ID to fetch
    }
  }, [productId, session, sessionStatus, router]);


  // Combined loading state for session and product data
  if (sessionStatus === 'loading' || (isLoading && !error) ) { // Show loader if session is loading OR product data is loading (and no error yet)
    return <div className="p-6"><PageLoader message="Loading product details..." /></div>;
  }

  // Handle auth failures after loading (should be caught by useEffect redirect, but as a fallback)
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
     return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>;
  }

  // Handle errors during data fetching or if no product ID
  if (error) {
    return (
        <div className="p-6"> {/* Ensure this is wrapped if AdminLayout isn't applied here */}
            <PageHeader title="Error" description={error} showBackButton={true} backButtonHref="/admin/products" />
        </div>
    );
  }
  
  // Handle case where product data couldn't be loaded but no specific error was set (e.g., product not found after loading)
  if (!initialProductData && !isLoading) { // Check !isLoading to ensure fetch attempt completed
     return (
        <div className="p-6"> {/* Ensure this is wrapped if AdminLayout isn't applied here */}
            <PageHeader title="Not Found" description="The requested product could not be found or ID is missing." showBackButton={true} backButtonHref="/admin/products" />
        </div>
     );
  }
  
  // If initialProductData is still null but we are not loading and no error, something is unexpected.
  // This should ideally be caught by the conditions above.
  if (!initialProductData) {
    return <div className="p-6"><PageLoader message="Preparing form..." /></div>; // Fallback while data might still be populating
  }


  return (
    // AdminLayout is applied by src/app/admin/layout.tsx
    <>
      <PageHeader
        title="Edit Product"
        description={`Updating: ${initialProductData.name || 'product'}`}
        showBackButton={true}
        backButtonHref="/admin/products"
      />
      <div className="mt-6 max-w-2xl mx-auto">
        <ProductForm 
          initialData={initialProductData} 
          onSubmitSuccess={(message) => {
            console.log("Product update success callback:", message);
            // Optionally refresh data or provide stronger feedback
            // For now, ProductForm shows its own success message
            // router.push('/admin/products'); // Or redirect after a delay
          }}
        />
      </div>
    </>
  );
};

export default EditProductPage;