// /src/lib/supabase/client.ts
// This file is safe for the browser.
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

// This is the one and only client that should be used in Client Components.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);