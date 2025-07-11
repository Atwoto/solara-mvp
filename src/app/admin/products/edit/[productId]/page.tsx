// /src/app/admin/products/edit/[productId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product } from '@/types'; 
import { ProductForm } from '@/components/admin/ProductForm'; // Use the named export
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import { motion } from 'framer-motion';

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
    // Authentication and authorization checks
    if (sessionStatus === 'loading') return; 
    if (sessionStatus === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/products/edit/${productId || ''}`); 
        return;
    }
    if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/'); 
        return;
    }

    // Fetch the specific product's data if authenticated and productId exists
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
    } else if (!productId) {
        setError("Product ID is missing in the URL.");
        setIsLoading(false);
    }
  }, [productId, session, sessionStatus, router]);


  if (sessionStatus === 'loading' || isLoading) {
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
  
  if (!initialProductData) {
     return (
        <div className="p-6">
            <PageHeader title="Not Found" description="The requested product could not be found." showBackButton={true} backButtonHref="/admin/products" />
        </div>
     );
  }

  return (
    <>
      <PageHeader
        title="Edit Product"
        description={`Updating: ${initialProductData.name || 'product'}`}
        showBackButton={true}
        backButtonHref="/admin/products"
      />
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ProductForm 
          initialData={initialProductData} 
          onSubmitSuccess={(message: string) => {
            alert(message); // Or use a toast notification
            router.push('/admin/products');
          }}
        />
      </motion.div>
    </>
  );
};

export default EditProductPage;
