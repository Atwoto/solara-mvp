// /src/lib/supabase/server.ts
// This file is for SERVER-SIDE code only.
import { createClient } from '@supabase/supabase-js';

// This is the powerful admin client for our API routes and Server Components.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);