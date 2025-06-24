// src/components/SupabaseListener.tsx
'use client';

import { useEffect, useMemo } from 'react'; // Import useMemo
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { signIn, signOut } from 'next-auth/react';

export default function SupabaseListener() {
  const router = useRouter();
  
  // THE FIX: Create the client instance once using useMemo.
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await signIn('credentials', { session: JSON.stringify(session), redirect: false });
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        await signOut({ redirect: false });
        router.refresh();
      }
    });
    return () => { subscription.unsubscribe(); };
  }, [supabase, router]);

  return null;
}