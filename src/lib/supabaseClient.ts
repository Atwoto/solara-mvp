// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
// THE FIX: Import from the new, correct '@supabase/ssr' library
import { createBrowserClient } from '@supabase/ssr';

// --- Server-Side Clients (No changes here) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;
if (supabaseServiceRoleKey) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}
export const supabaseAdmin = supabaseAdminInstance;


// --- NEW Client-Side Auth Helper Client ---
// This now correctly uses the function from the '@supabase/ssr' package.
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );