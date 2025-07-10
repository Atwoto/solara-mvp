// src/app/api/admin/county-resources/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; 

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// The POST function for creating/updating remains the same.
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resourceData = await req.json();

    if (!resourceData.county_name || !resourceData.file_title || !resourceData.file_url) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('county_resources')
      .upsert(resourceData) 
      .select()
      .single();

    if (error) {
      console.error("Database Error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- THIS IS THE NEW DELETE FUNCTION ---
export async function DELETE(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
  
    // First, check if the logged-in user is the admin.
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  
    try {
      const { resourceId, fileUrl } = await req.json();
  
      if (!resourceId || !fileUrl) {
        return NextResponse.json({ error: 'Missing required data for deletion.' }, { status: 400 });
      }
  
      // Step 1: Delete the file from Supabase Storage.
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabaseAdmin.storage.from('county-resources').remove([fileName]);
        if (storageError) {
          // Log the error but don't stop the process, as we still want to remove the database entry.
          console.error('Could not delete file from storage, but proceeding with DB deletion:', storageError.message);
        }
      }
  
      // Step 2: Delete the row from the database table.
      const { error: dbError } = await supabaseAdmin.from('county_resources').delete().eq('id', resourceId);
      if (dbError) {
        throw new Error(dbError.message);
      }
  
      return NextResponse.json({ message: 'Resource deleted successfully.' });
  
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
