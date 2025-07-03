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
import { motion, Variants } from 'framer-motion'; // --- THE FIX: Import Variants type ---

// Types remain the same
interface ActivityItem {
  id: string;
  type: 'order' | 'newUser' | 'newProduct' | 'newArticle' | 'newTestimonial';
  timestamp: string;
  title: string;
  description?: string;
  link?: string;
}

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

interface DashboardStatCardProps {
  item: {
    name: string;
    stat: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  };
  variants: Variants;
}

interface DashboardStatsApiResponse {
  totalRevenue: number;
  newOrdersCount: number;
  newCustomersThisMonth: number;
  totalOverallCustomers: number;
  totalProducts: number;
  totalArticles: number;
}

// --- IMPRESSIVE NEW STAT CARD ---
const StatCard = ({ item, variants }: DashboardStatCardProps) => (
  <motion.div variants={variants} className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-lg transition-all duration-300">
    <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${item.color}`}></div>
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${item.color} bg-opacity-10`}>
        <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} aria-hidden="true" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="truncate text-sm font-medium text-slate-500">{item.name}</dt>
          <dd><div className="text-2xl font-bold text-slate-800">{item.stat}</div></dd>
        </dl>
      </div>
    </div>
  </motion.div>
);

const AdminDashboardPage = () => {
  // All state and logic hooks remain the same
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
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      setApiStats(await response.json());
    } catch (err: any) {
      setError(prev => prev ? `${prev}\nStats: ${err.message}` : `Stats: ${err.message}`);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    try {
      const response = await fetch('/api/admin/dashboard/recent-activity');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      setRecentActivity(await response.json());
    } catch (err: any) {
      setError(prev => prev ? `${prev}\nActivity: ${err.message}` : `Activity: ${err.message}`);
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
      const response = await fetch('/api/admin/knowledge/generate-embeddings', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
      alert(`Success! ${result.message}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdatingKnowledge(false);
    }
  };

  const isLoadingPage = sessionStatus === 'loading' || (isLoadingStats && isLoadingActivity);
  if (isLoadingPage) {
    return <div className="p-6"><PageLoader message="Loading dashboard data..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>; 
  }

  const displayedStats = apiStats ? [
    { name: 'Total Revenue', stat: `Ksh ${apiStats.totalRevenue.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'text-green-600 bg-green-500' },
    { name: 'New Orders (Month)', stat: apiStats.newOrdersCount, icon: ShoppingCartIcon, color: 'text-sky-600 bg-sky-500' },
    { name: 'New Customers (Month)', stat: apiStats.newCustomersThisMonth, icon: UsersIcon, color: 'text-amber-600 bg-amber-500' },
    { name: 'Total Products', stat: apiStats.totalProducts, icon: CubeIcon, color: 'text-purple-600 bg-purple-500' },
    { name: 'Total Articles', stat: apiStats.totalArticles, icon: NewspaperIcon, color: 'text-indigo-600 bg-indigo-500' },
    { name: 'Registered Users', stat: apiStats.totalOverallCustomers, icon: UserGroupIcon, color: 'text-rose-600 bg-rose-500' },
  ] : [];

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'order': return <ShoppingCartIcon className={`${iconClass} text-sky-500`} />;
      case 'newUser': return <UsersIcon className={`${iconClass} text-green-500`} />;
      case 'newProduct': return <CubeIcon className={`${iconClass} text-purple-500`} />;
      case 'newArticle': return <NewspaperIcon className={`${iconClass} text-indigo-500`} />;
      case 'newTestimonial': return <ChatBubbleBottomCenterTextIcon className={`${iconClass} text-rose-500`} />;
      default: return <ArrowUpRightIcon className={`${iconClass} text-slate-400`} />;
    }
  };
  
  // --- THE FIX: Explicitly typed animation variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <>
      <PageHeader 
        title="Dashboard"
        description="An overview of your e-commerce activity and performance."
      >
        <button
          onClick={handleUpdateKnowledge}
          disabled={isUpdatingKnowledge}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${isUpdatingKnowledge ? 'animate-spin' : ''}`} />
          {isUpdatingKnowledge ? 'Updating...' : 'Update Chatbot Knowledge'}
        </button>
      </PageHeader>

      {error && <div className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm whitespace-pre-line" role="alert">{error}</div>}
      
      {!isLoadingStats && apiStats && (
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {displayedStats.map((item) => <StatCard key={item.name} item={item} variants={itemVariants} />)}
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
      >
        <div className="xl:col-span-2 space-y-8">
          <motion.div variants={itemVariants}><div className="bg-white p-4 sm:p-6 shadow-sm border border-slate-200/80 rounded-xl"><h2 className="text-xl font-semibold text-deep-night mb-1">Sales Trend</h2><p className="text-xs text-slate-500 mb-4">Revenue over the last 7 days.</p><SalesChart /></div></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}><div className="bg-white p-4 sm:p-6 shadow-sm border border-slate-200/80 rounded-xl"><h2 className="text-xl font-semibold text-deep-night mb-1">Order Statuses</h2><p className="text-xs text-slate-500 mb-4">Current distribution of all order statuses.</p><OrderStatusChart /></div></motion.div>
            <motion.div variants={itemVariants}><div className="bg-white p-4 sm:p-6 shadow-sm border border-slate-200/80 rounded-xl"><h2 className="text-xl font-semibold text-deep-night mb-1">New Customers</h2><p className="text-xs text-slate-500 mb-4">Registrations over the last 7 days.</p><NewCustomersChart /></div></motion.div>
          </div>
        </div>
        <motion.div variants={itemVariants} className="bg-white p-6 shadow-sm border border-slate-200/80 rounded-xl xl:col-span-1">
          <h2 className="text-xl font-semibold text-deep-night mb-4">Recent Activity</h2>
          {isLoadingActivity && <PageLoader message="Loading activity..." />}
          {!isLoadingActivity && recentActivity.length === 0 && <p className="text-slate-500 text-sm">No recent activity to display.</p>}
          {recentActivity.length > 0 && (
            <ul role="list" className="divide-y divide-slate-200">
              {recentActivity.slice(0, 15).map((activity) => (
                <li key={`${activity.type}-${activity.id}`} className="py-4 hover:bg-slate-50/50 -mx-6 px-6 transition-colors">
                  <div className="flex space-x-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-slate-800 truncate" title={activity.title}>{activity.title}</h3><p className="text-xs text-slate-500 whitespace-nowrap ml-2">{new Date(activity.timestamp).toLocaleDateString()}</p></div>
                      {activity.description && <p className="text-sm text-slate-500 truncate" title={activity.description}>{activity.description}</p>}
                      {activity.link && (<Link href={activity.link} className="text-xs text-solar-flare-start hover:underline block truncate">View Details →</Link>)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default AdminDashboardPage;
