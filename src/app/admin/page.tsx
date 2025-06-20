// src/app/admin/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    CurrencyDollarIcon, ShoppingCartIcon, UsersIcon, CubeIcon, NewspaperIcon, UserGroupIcon,
    ChatBubbleBottomCenterTextIcon, ArrowUpRightIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import SalesChart from '@/components/admin/SalesChart'; 
import OrderStatusChart from '@/components/admin/OrderStatusChart';
import NewCustomersChart from '@/components/admin/NewCustomersChart';

interface ActivityItem {
  id: string;
  type: 'order' | 'newUser' | 'newProduct' | 'newArticle' | 'newTestimonial';
  timestamp: string;
  title: string;
  description?: string;
  link?: string;
}

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

interface DashboardStatCard {
  name: string;
  stat: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface DashboardStatsApiResponse {
  totalRevenue: number;
  newOrdersCount: number;
  newCustomersThisMonth: number;
  totalOverallCustomers: number;
  totalProducts: number;
  totalArticles: number;
}

const AdminDashboardPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [apiStats, setApiStats] = useState<DashboardStatsApiResponse | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isUpdatingKnowledge, setIsUpdatingKnowledge] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({message: "Failed to parse stats error response"}));
        throw new Error(errData.message || 'Failed to fetch dashboard stats');
      }
      const data: DashboardStatsApiResponse = await response.json();
      setApiStats(data);
    } catch (err: any) {
      setError(prevError => prevError ? `${prevError}\nStats: ${err.message}` : `Stats: ${err.message}`);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    try {
      const response = await fetch('/api/admin/dashboard/recent-activity');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({message: "Failed to parse activity error response"}));
        throw new Error(errData.message || 'Failed to fetch recent activity');
      }
      const data: ActivityItem[] = await response.json();
      setRecentActivity(data);
    } catch (err: any) {
      setError(prevError => prevError ? `${prevError}\nActivity: ${err.message}` : `Activity: ${err.message}`);
      console.error("Error fetching recent activity:", err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      setError(null); 
      fetchDashboardStats();
      fetchRecentActivity();
    }
  }, [sessionStatus, session, fetchDashboardStats, fetchRecentActivity]);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (sessionStatus === 'unauthenticated') router.replace(`/login?callbackUrl=/admin`);
    else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) router.replace('/');
  }, [session, sessionStatus, router]);

  const handleUpdateKnowledge = async () => {
    setIsUpdatingKnowledge(true);
    alert("Starting chatbot knowledge base update. This can take a moment. You'll receive another alert when it's complete.");
    try {
      const response = await fetch('/api/admin/knowledge/generate-embeddings', { 
        method: 'POST' 
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred during the update.');
      }
      alert(`Success! ${result.message}`);
    } catch (err: any) {
      console.error("Failed to update knowledge base:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdatingKnowledge(false);
    }
  };

  const isLoadingPage = sessionStatus === 'loading' || isLoadingStats || (isLoadingActivity && !apiStats && recentActivity.length === 0);

  if (isLoadingPage) {
    return <div className="p-6"><PageLoader message="Loading dashboard data..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>;
  }

  const displayedStats: DashboardStatCard[] = apiStats ? [
    { name: 'Total Revenue', stat: `Ksh ${apiStats.totalRevenue.toLocaleString()}`, icon: CurrencyDollarIcon },
    { name: 'New Orders (This Month)', stat: apiStats.newOrdersCount, icon: ShoppingCartIcon },
    { name: 'New Customers (This Month)', stat: apiStats.newCustomersThisMonth, icon: UsersIcon },
    { name: 'Total Registered Users', stat: apiStats.totalOverallCustomers, icon: UserGroupIcon },
    { name: 'Total Products', stat: apiStats.totalProducts, icon: CubeIcon },
    { name: 'Total Articles', stat: apiStats.totalArticles, icon: NewspaperIcon },
  ] : [];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return <ShoppingCartIcon className="h-5 w-5 text-blue-500" />;
      case 'newUser': return <UsersIcon className="h-5 w-5 text-green-500" />;
      case 'newProduct': return <CubeIcon className="h-5 w-5 text-purple-500" />;
      case 'newArticle': return <NewspaperIcon className="h-5 w-5 text-orange-500" />;
      case 'newTestimonial': return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-pink-500" />;
      default: return <ArrowUpRightIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <>
      <PageHeader 
        title="Dashboard"
        description="Overview of your e-commerce activity."
      >
        <button
          onClick={handleUpdateKnowledge}
          disabled={isUpdatingKnowledge}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${isUpdatingKnowledge ? 'animate-spin' : ''}`} />
          {isUpdatingKnowledge ? 'Updating...' : 'Update Chatbot Knowledge'}
        </button>
      </PageHeader>

      {error && <div className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm whitespace-pre-line" role="alert">{error}</div>}
      
      {isLoadingStats && !apiStats && <div className="py-4"><PageLoader message="Loading statistics..." /></div>}
      {!isLoadingStats && apiStats && displayedStats.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 mb-8">
          {displayedStats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full">
                  <item.icon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                    <dd><div className="text-2xl font-bold text-deep-night">{item.stat}</div></dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoadingStats && !apiStats && !error && (
        <p className="text-gray-500 my-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">Could not load summary statistics.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg"><h2 className="text-xl font-semibold text-deep-night mb-1">Sales Trend</h2><p className="text-xs text-gray-500 mb-4">Revenue over the last 7 days.</p><SalesChart /></div>
          <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg"><h2 className="text-xl font-semibold text-deep-night mb-1">Order Statuses</h2><p className="text-xs text-gray-500 mb-4">Current distribution of all order statuses.</p><OrderStatusChart /></div>
          <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg"><h2 className="text-xl font-semibold text-deep-night mb-1">New Customer Trend</h2><p className="text-xs text-gray-500 mb-4">Registrations over the last 7 days.</p><NewCustomersChart /></div>
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg lg:col-span-1">
          <h2 className="text-xl font-semibold text-deep-night mb-4">Recent Activity</h2>
          {isLoadingActivity && recentActivity.length === 0 && <div className="py-4"><PageLoader message="Loading recent activity..." /></div>}
          {!isLoadingActivity && recentActivity.length === 0 && (!error || !error.includes("Activity Error")) && (<p className="text-gray-600">No recent activity to display.</p>)}
          {!isLoadingActivity && error && error.includes("Activity Error") && (!error.includes("Stats Error") || !apiStats ) && (<p className="text-red-500 bg-red-50 p-3 rounded-md text-sm">Could not load recent activity.</p>)}
          {recentActivity.length > 0 && (
            <ul role="list" className="divide-y divide-gray-200 max-h-[80vh] overflow-y-auto">
              {recentActivity.map((activity) => (
                <li key={`${activity.type}-${activity.id}`} className="py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                  <div className="flex space-x-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-gray-800 truncate" title={activity.title}>{activity.title}</h3><p className="text-xs text-gray-500 whitespace-nowrap ml-2">{new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p></div>
                      {activity.description && <p className="text-sm text-gray-500 truncate" title={activity.description}>{activity.description}</p>}
                      {activity.link && (<Link href={activity.link} className="text-xs text-solar-flare-start hover:underline block truncate">View Details →</Link>)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!isLoadingActivity && recentActivity.length > 0 && (
              <div className="mt-6 text-center"><Link href="#" className="text-sm font-medium text-solar-flare-start hover:text-solar-flare-end hover:underline">View all activity logs (TBD) →</Link></div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;