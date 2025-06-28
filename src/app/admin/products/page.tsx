// src/app/admin/products/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import PageHeader from '@/components/admin/PageHeader'; 
import PageLoader from '@/components/PageLoader';     
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

const AdminProductsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchAdminProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setFetchError(null);
    setActionMessage(null);
    try {
      const response = await fetch('/api/products'); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error: any) {
      setFetchError(error.message || 'Could not load products.');
      console.error("Error fetching products for admin:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []); 

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
        fetchAdminProducts();
    }
  }, [status, session, fetchAdminProducts]);

  useEffect(() => {
    if (status === 'loading') return; 
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/admin/products`);
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      router.replace('/'); 
    }
  }, [session, status, router]);

  const handleDeleteProduct = async (productId: string, productName: string) => {
    // This function seems to have a small bug with `productId: string | undefined`
    // I've simplified it to `string` based on how it's called.
    if (!window.confirm(`Are you sure you want to delete the product: "${productName}"?\nThis action cannot be undone.`)) {
        return;
    }
    setActionMessage(null);
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
        });
        const contentType = response.headers.get("content-type");
        let result;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            if (response.ok) {
                result = { message: `Product "${productName}" deleted successfully.` };
            } else {
                result = { message: `Failed to delete product. Status: ${response.status}` };
            }
        }
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete product');
        }
        setActionMessage({ type: 'success', text: result.message });
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (err: any) {
        console.error("Delete product error:", err);
        setActionMessage({ type: 'error', text: `Error deleting product: ${err.message}` });
    }
  };

  if (status === 'loading' || (isLoadingProducts && products.length === 0 && !fetchError)) {
    return <div className="p-6"><PageLoader message="Loading products..." /></div>;
  }
  if (status !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>;
  }

  return (
    <>
      <PageHeader 
        title="Manage Products"
        description="View, add, edit, or delete products from the catalog."
      >
        <Link href="/admin/products/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center">
          <PlusIcon className="h-5 w-5 mr-1.5 -ml-0.5" />
          Add New Product
        </Link>
      </PageHeader>
      
      {actionMessage && (
        <div className={`p-3 my-4 rounded-md text-sm ${
            actionMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' 
                                             : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
            {actionMessage.text}
        </div>
      )}
      {fetchError && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{fetchError}</p>}

      {isLoadingProducts && products.length === 0 && !fetchError && (
         <div className="text-center py-10"><PageLoader message="Loading products list..." /></div>
      )}
      {!isLoadingProducts && products.length === 0 && !fetchError && (
          <div className="text-center py-10 text-gray-500">
            <p>No products found.</p>
            <Link href="/admin/products/new" className="text-solar-flare-start hover:underline mt-2 inline-block">
                Add your first product
            </Link>
          </div>
      )}

      {products.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wattage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image_url && product.image_url[0] ? (
                      <Image src={product.image_url[0]} alt={product.name} width={40} height={40} className="h-10 w-10 object-cover rounded" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.wattage ? `${product.wattage}W` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    {/* *** THIS IS THE FIX: Correct the link structure *** */}
                    <Link href={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-800 p-1 inline-flex items-center" title="Edit">
                      <PencilSquareIcon className="h-5 w-5"/>
                    </Link>
                    <button 
                        onClick={() => handleDeleteProduct(product.id, product.name)} 
                        className="text-red-600 hover:text-red-800 p-1 inline-flex items-center"
                        title="Delete"
                        disabled={!product.id}
                    >
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminProductsPage;