// /src/components/SupabaseListener.tsx -- This code is now correct
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
      // The type error is gone. Both session objects now have the accessToken property.
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