import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage';

// Beautiful loading skeleton with glassmorphism
function LoadingFormSkeleton() {
    return (
        <div className="w-full max-w-md transform transition-all duration-700">
            <div className="p-8 space-y-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl shadow-black/20 relative overflow-hidden animate-pulse">
                {/* Glass reflection effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                
                {/* Header skeleton */}
                <div className="text-center space-y-4 relative">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl"></div>
                    </div>
                    <div className="h-10 bg-white/10 rounded-xl w-3/4 mx-auto"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-1/2 mx-auto"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3 mx-auto"></div>
                </div>

                {/* Google button skeleton */}
                <div className="h-14 bg-white/20 rounded-2xl"></div>

                {/* Divider skeleton */}
                <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <div className="flex-shrink mx-6 w-12 h-8 bg-white/5 rounded-full"></div>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Form skeleton */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <div className="h-12 bg-white/10 rounded-xl"></div>
                    </div>
                    <div className="space-y-1">
                        <div className="h-12 bg-white/10 rounded-xl"></div>
                    </div>
                    <div className="text-right">
                        <div className="h-4 bg-white/10 rounded w-24 ml-auto"></div>
                    </div>
                    <div className="h-14 bg-white/20 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 4}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <Suspense fallback={<LoadingFormSkeleton />}>
          <LoginClientPage />
        </Suspense>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}