// src/components/admin/AdminLayout.tsx
'use client'; 

import { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLoader from '../PageLoader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com'; 

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and Authorization logic remains the same
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=' + encodeURIComponent(window.location.pathname)); 
      return;
    }
    if (session && session.user?.email !== ADMIN_EMAIL) {
      router.replace('/'); 
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <PageLoader message="Verifying admin access..." /> 
      </div>
    );
  }

  // Check for authenticated admin session before rendering the layout
  if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-800">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Added a subtle top border to the main content area */}
          <main className="flex-1 p-6 lg:p-8 border-t border-slate-200">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback for unauthorized users, will quickly redirect
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <PageLoader message="Access Denied. Redirecting..." /> 
    </div>
  );
};

export default AdminLayout;
