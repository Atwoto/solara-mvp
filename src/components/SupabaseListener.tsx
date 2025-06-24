// src/components/SupabaseListener.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// This component will be a client-side listener for Supabase auth events.
export default function SupabaseListener() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // This listener fires every time the user's auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // The SIGNED_IN event fires after a successful login.
      if (event === 'SIGNED_IN') {
        // A router.refresh() is a "soft" refresh. It re-fetches server data
        // and re-renders Server Components without losing client-side state.
        // This is the key to making the UI update.
        router.refresh();
      }
      // The SIGNED_OUT event fires after a successful logout.
      if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return null; // This component renders nothing. It's just a listener.
}