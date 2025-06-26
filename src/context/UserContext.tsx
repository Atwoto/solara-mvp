// /src/context/UserContext.tsx -- FINAL CORRECTED VERSION
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// --- THE FINAL FIX: Import the correct function for Client Components ---
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  supabase: SupabaseClient;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Create the browser-safe client once using the correct function
  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    const getInitialUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoading(false);
    }
    
    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Refresh the page on login/logout to ensure all server components re-render
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const value = { user, isLoading, supabase };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};