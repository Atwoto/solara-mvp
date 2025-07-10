// src/app/api/admin/county-resources/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; 

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// POST function remains the same
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
      console.error("Database Error on POST:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Catch Block Error on POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- UPDATED DELETE FUNCTION WITH DETAILED LOGGING ---
export async function DELETE(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
  
    // 1. Verify the user is the admin.
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.email !== ADMIN_EMAIL) {
      console.error("DELETE FAILED: User is not the admin.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  
    try {
      const { resourceId, fileUrl } = await req.json();
  
      if (!resourceId || !fileUrl) {
        console.error("DELETE FAILED: Missing resourceId or fileUrl in request body.");
        return NextResponse.json({ error: 'Missing required data for deletion.' }, { status: 400 });
      }
  
      // 2. Attempt to delete the file from Storage.
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        console.log(`Attempting to delete file from storage: ${fileName}`);
        const { error: storageError } = await supabaseAdmin.storage.from('county-resources').remove([fileName]);
        if (storageError) {
          // If this fails, we log the specific error.
          console.error('!!! STORAGE DELETION FAILED !!!', storageError);
        } else {
            console.log("File deleted from storage successfully.");
        }
      }
  
      // 3. Attempt to delete the row from the database.
      console.log(`Attempting to delete row from database with id: ${resourceId}`);
      const { error: dbError } = await supabaseAdmin.from('county_resources').delete().eq('id', resourceId);
      if (dbError) {
        // If this fails, we log the specific error.
        console.error('!!! DATABASE DELETION FAILED !!!', dbError);
        throw new Error(dbError.message);
      }
  
      console.log("Database row deleted successfully.");
      return NextResponse.json({ message: 'Resource deleted successfully.' });
  
    } catch (error: any) {
      console.error("!!! UNEXPECTED ERROR IN DELETE FUNCTION CATCH BLOCK !!!", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
