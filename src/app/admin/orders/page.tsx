// src/app/admin/orders/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// REMOVE: import AdminLayout from '@/components/admin/AdminLayout'; // No longer needed here
import PageHeader from '@/components/admin/PageHeader'; // For consistent page titles
import PageLoader from '@/components/PageLoader';     // For consistent loading states

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  user_id: string; // Assuming user_id is available directly
  // If you need user details like email/name, you might need to join or fetch separately
  // user?: { email?: string | null; name?: string | null; }; 
}

const statusStyles: { [key: string]: string } = {
  pending_payment: 'bg-gray-100 text-gray-800', // Example for new status
  pending_verification: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-pink-100 text-pink-800',
};

const AdminOrdersPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Page-level security guard (AdminLayout in src/app/admin/layout.tsx also handles this)
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (sessionStatus === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/admin/orders`);
    } else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      router.replace('/');
    }
  }, [session, sessionStatus, router]);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        // Ensure this API endpoint exists and returns all orders for admin
        const response = await fetch('/api/admin/orders/all'); // Or your specific endpoint
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setFetchError(error.message || "Could not load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionStatus === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      fetchOrders();
    }
  }, [sessionStatus, session]); // Re-fetch if session status changes (e.g., after login)

  // Let src/app/admin/layout.tsx handle the main loading/auth UI
  if (sessionStatus === 'loading') {
    return <div className="p-6"><PageLoader message="Loading orders page..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    // The <AdminLayout> wrapper is applied by src/app/admin/layout.tsx
    <>
      <PageHeader 
        title="Manage Orders"
        description="View and manage customer orders."
        // No "Add New" button for orders typically, but you could add filters or export actions here
      />
      
      {fetchError && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{fetchError}</p>}

      {isLoading && orders.length === 0 && (
        <div className="text-center py-10"><PageLoader message="Loading orders..." /></div>
      )}

      {!isLoading && orders.length === 0 && !fetchError && (
        <div className="text-center py-10 text-gray-500">
            <p>No orders found.</p>
            {/* You might not "add" orders manually here, but this is a placeholder */}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                {/* Consider adding Customer Email/Name if available from a join */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-gray-600 hover:text-blue-600">
                    {/* Link to order details page */}
                    <a href={`/admin/orders/${order.id}`} title={order.id}>{order.id.substring(0, 8)}...</a> 
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-gray-500" title={order.user_id}>
                    {order.user_id ? `${order.user_id.substring(0, 8)}...` : 'Guest'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">Ksh {order.total_price.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status.toLowerCase().replace(/ /g, '_')] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Link to order details page */}
                    <a href={`/admin/orders/${order.id}`} className="text-solar-flare-end hover:text-solar-flare-start">
                      View Details
                    </a>
                    {/* You might add actions like "Update Status" here later */}
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

export default AdminOrdersPage;