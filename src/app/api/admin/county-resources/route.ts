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

// --- THIS IS THE CORRECTED DELETE FUNCTION ---
export async function DELETE(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
  
    // Step 1: Verify the user is the admin.
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  
    try {
      const { resourceId, fileUrl } = await req.json();
  
      if (!resourceId || !fileUrl) {
        return NextResponse.json({ error: 'Missing required data for deletion.' }, { status: 400 });
      }
  
      // Step 2: Delete the file from Storage using the ADMIN client.
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabaseAdmin.storage.from('county-resources').remove([fileName]);
        if (storageError) {
          console.error('Storage Deletion Error:', storageError.message);
          // We can choose to continue even if file deletion fails, to remove the DB record.
        }
      }
  
      // Step 3: Delete the row from the database using the ADMIN client.
      const { error: dbError } = await supabaseAdmin.from('county_resources').delete().eq('id', resourceId);
      if (dbError) {
        console.error('Database Deletion Error:', dbError.message);
        throw new Error(dbError.message);
      }
  
      return NextResponse.json({ message: 'Resource deleted successfully.' });
  
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
