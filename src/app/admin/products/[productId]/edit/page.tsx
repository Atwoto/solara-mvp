// src/app/admin/products/edit/[productId]/page.tsx
// NO CHANGES NEEDED IN THIS FILE.
// Its only job is to fetch the initial data and pass it to the form.
// The data fetching and prop passing logic is correct.

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product } from '@/types'; 
import ProductForm from '@/components/admin/ProductForm';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params?.productId === 'string' ? params.productId : undefined;

  const { data: session, status: sessionStatus } = useSession();
  
  const [initialProductData, setInitialProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') {
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

    if (sessionStatus === 'authenticated' && session.user.email === ADMIN_EMAIL && productId) {
      const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);
        try {
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
          setIsLoading(false);
        }
      };
      fetchProductData();
    } else if (!productId && sessionStatus === 'authenticated' && session.user.email === ADMIN_EMAIL) {
        setError("Product ID is missing in the URL.");
        setIsLoading(false);
    }
  }, [productId, session, sessionStatus, router]);


  if (sessionStatus === 'loading' || (isLoading && !error) ) {
    return <div className="p-6"><PageLoader message="Loading product details..." /></div>;
  }

  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
     return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>;
  }

  if (error) {
    return (
        <div className="p-6">
            <PageHeader title="Error" description={error} showBackButton={true} backButtonHref="/admin/products" />
        </div>
    );
  }
  
  if (!initialProductData && !isLoading) {
     return (
        <div className="p-6">
            <PageHeader title="Not Found" description="The requested product could not be found or ID is missing." showBackButton={true} backButtonHref="/admin/products" />
        </div>
     );
  }
  
  if (!initialProductData) {
    return <div className="p-6"><PageLoader message="Preparing form..." /></div>;
  }

  return (
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
          }}
        />
      </div>
    </>
  );
};

export default EditProductPage;