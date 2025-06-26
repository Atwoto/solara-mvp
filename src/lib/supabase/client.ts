// /src/lib/supabase/client.ts -- FINAL CORRECTED VERSION
// This file is safe for the browser.
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This is the one and only client that should be used in Client Components.
// It is created once here and exported for use throughout the app.
export const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});