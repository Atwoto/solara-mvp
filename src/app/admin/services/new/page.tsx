// src/app/admin/services/new/page.tsx
'use client'; // Add this directive as it renders client components and might use hooks

import ServiceForm from '@/components/admin/ServiceForm'; // Path to your ServiceForm component
import PageHeader from '@/components/admin/PageHeader';   // Path to your PageHeader component
// You might also need useSession and useRouter here if you add page-level auth checks
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

export default function NewServicePage() {
  // const router = useRouter();
  // const { data: session, status } = useSession();

  // Example of a page-level auth guard, though AdminLayout should handle primary auth
  // useEffect(() => {
  //   if (status === 'loading') return;
  //   if (status === 'unauthenticated') router.replace('/login?callbackUrl=/admin/services/new');
  //   else if (status === 'authenticated' && session?.user?.email !== 'YOUR_ADMIN_EMAIL@example.com') router.replace('/');
  // }, [session, status, router]);

  // if (status === 'loading') {
  //   return <div className="p-6">Loading page...</div>; // Or use PageLoader
  // }
  // if (status !== 'authenticated' || session?.user?.email !== 'YOUR_ADMIN_EMAIL@example.com') {
  //   return <div className="p-6">Access Denied or Redirecting...</div>; // Or use PageLoader
  // }

  return (
    // The AdminLayout (with sidebar etc.) is applied by src/app/admin/layout.tsx
    // This component just returns the content for the "new service" page.
    <div> {/* Or use a React Fragment <> */}
      <PageHeader
        title="Add New Service"
        description="Fill in the details for the new installation service."
        showBackButton={true}
        backButtonHref="/admin/services" // Link back to the services list
      />
      <div className="mt-8">
        <ServiceForm /> {/* This is where your actual form with inputs will be rendered */}
      </div>
    </div>
  );
}