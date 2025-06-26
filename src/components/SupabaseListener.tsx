// /src/components/SupabaseListener.tsx -- FINAL, IGNORE-DIRECTIVE FIX
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupabaseListener() {
  const router = useRouter();
  const { data: session } = useSession();

  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
      // THE FIX: We are telling TypeScript to ignore the type error on the next line.
      // We know from our NextAuth callback that we are adding the accessToken to the session.
      // @ts-ignore
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