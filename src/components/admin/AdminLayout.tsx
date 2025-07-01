// src/components/admin/AdminLayout.tsx
'use client'; 

import { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageLoader from '../PageLoader'; // <<--- CORRECTED IMPORT PATH

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com'; 

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // console.log("AdminLayout useEffect: session status -", status, "session -", session); 

    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      // console.log("AdminLayout: Unauthenticated, redirecting to login."); 
      router.replace('/login?callbackUrl=' + encodeURIComponent(window.location.pathname)); 
      return;
    }

    if (session && session.user?.email !== ADMIN_EMAIL) {
      // console.warn(`AdminLayout: Unauthorized access attempt by ${session.user?.email}, redirecting.`); 
      router.replace('/'); 
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <PageLoader message="Verifying admin access..." /> 
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // console.log("AdminLayout: Fallback rendering - Access Denied state."); 
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
        <PageLoader message="Access Denied. Redirecting..." /> 
    </div>
  );
};

export default AdminLayout;