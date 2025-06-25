// /src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// --- Client-Side Client ---
// This uses the anonymous key and is safe to use in the browser.
// It's used for fetching public data like products, blog posts, etc.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- Admin Client (Server-Side ONLY) ---
// This is the new, important part.
// It uses the powerful Service Role Key to bypass RLS for admin tasks.
// We add a check to ensure it's only created on the server to prevent errors.
let supabaseAdminInstance: any = null;

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdminInstance = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
} else {
  console.warn("Supabase service role key not found. Admin client not initialized.");
}

// Export the admin client instance so your API routes can import it.
export const supabaseAdmin = supabaseAdminInstance;

// You can also keep your auth helper function if other parts of your app use it.
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
export const createSupabaseBrowserClient = () => createClientComponentClient();