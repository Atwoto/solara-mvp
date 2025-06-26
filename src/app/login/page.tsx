// /src/app/login/page.tsx -- FINAL CORRECTED VERSION
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

// A simple loading component to show while the main form loads
function Loading() {
  return <div className="text-center">Loading your secure login form...</div>;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}