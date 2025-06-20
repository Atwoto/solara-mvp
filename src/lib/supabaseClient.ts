// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
// Make sure your Product type is correctly imported or defined if needed here
// If Product is only used in API routes that import this, you might not need it directly in this file
// import { Product } from '@/types'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !supabaseAnonKey) { // Service role key might not be needed by all clients
  throw new Error("Supabase URL or Anon Key is not defined in .env.local. Service Role Key might also be needed for admin operations.");
}

// Client for public (anon) access - typically for read operations
// This client is safe to use on the client-side if needed, but primarily for API routes using anon key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations requiring elevated privileges (service_role)
// Use this for operations like insert, update, delete from server-side API routes
// Ensure SUPABASE_SERVICE_ROLE_KEY is defined in your .env.local for this to work
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

if (supabaseServiceRoleKey) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false, 
        }
    });
} else {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Admin client will not be available.");
}

export const supabaseAdmin = supabaseAdminInstance;

// Example usage:
// if (supabaseAdmin) {
//   const { data, error } = await supabaseAdmin.from('your_table').select('*');
// } else {
//   console.error("Supabase admin client is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
// }