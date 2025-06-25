// /src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// --- THE FIX IS HERE ---
// We are importing the CORRECTLY named function from the library.
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This is your general-purpose client for simple queries. It's fine.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is the function that was causing the error.
// We are now exporting a function that calls the CORRECT function from the import.
export const createSupabaseBrowserClient = () => createClientComponentClient();