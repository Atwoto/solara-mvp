// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types'; // Assuming your Product type is in @/types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;


if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL, Anon Key, or Service Role Key is not defined in .env.local");
}

// Client for public (anon) access - typically for read operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations requiring elevated privileges (service_role)
// Use this for operations like insert, update, delete from server-side API routes
export const supabaseAdmin = createClient<Product>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // autoRefreshToken: false, // Optional: configure as needed
    // persistSession: false, // Optional: configure as needed
  }
});

// Helper for generic database type, if you don't specify it in createClient
// export const supabaseAdminGeneric = createClient(supabaseUrl, supabaseServiceRoleKey);