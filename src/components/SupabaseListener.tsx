// /src/components/SupabaseListener.tsx -- FINAL, CORRECTED IMPORT
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// --- THE FIX: Import the CORRECT function for Client Components ---
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupabaseListener() {
  const router = useRouter();
  const { data: session } = useSession();

  // THE FIX: Use the correct function name here.
  // We use useMemo to ensure this only runs once per component mount.
  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
      // This logic checks if the session token from Supabase is different
      // from the one NextAuth has. If so, it refreshes the page to sync them.
      if (supabaseSession?.access_token !== session?.accessToken) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session, router, supabase]);

  return null;
}