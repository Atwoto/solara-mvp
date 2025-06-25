// src/context/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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
  
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      // This is the key: refresh the page on login/logout to re-fetch server data.
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