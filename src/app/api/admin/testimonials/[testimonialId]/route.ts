// src/app/api/admin/testimonials/[testimonialId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
// BlogPost type might not be needed if not used for PUT,
// but Testimonial type might be useful if you want to type testimonialData
// import { Testimonial } from '@/types'; 

// You might have a PUT/PATCH handler here for full edits
// export async function PUT(req: NextRequest, { params }: { params: { testimonialId: string } }) { ... }


export async function DELETE(req: NextRequest, { params }: { params: { testimonialId: string } }) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized for DELETE testimonial.");
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  const testimonialId = params.testimonialId;
  if (!testimonialId) {
    return NextResponse.json({ message: 'Testimonial ID is required' }, { status: 400 });
  }

  try {
    // 1. Optional: Get the testimonial to find its image_url for deletion from storage
    const { data: testimonialData, error: fetchError } = await supabaseAdmin
        .from('testimonials')
        .select('image_url') // Only select the image_url
        .eq('id', testimonialId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means not found
        throw new Error(`Error fetching testimonial for delete: ${fetchError.message}`);
    }

    // 2. Delete the testimonial from the database
    const { error: deleteError } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);

    if (deleteError) {
      throw new Error(`Database delete error: ${deleteError.message}`);
    }

    // 3. If testimonial existed and had a valid image_url string, delete it from storage
    if (testimonialData && typeof testimonialData.image_url === 'string' && testimonialData.image_url.trim() !== '') {
      const imageUrlString = testimonialData.image_url; // Now TypeScript knows this is a non-empty string
      try {
        const urlObject = new URL(imageUrlString); // This should now be fine
        const pathSegments = urlObject.pathname.split('/');
        const bucketNameInPath = 'product-images'; // <<--- YOUR BUCKET NAME (ensure this is correct)
        const bucketIndex = pathSegments.indexOf(bucketNameInPath);

        if (bucketIndex !== -1 && bucketIndex < pathSegments.length -1) {
            const storagePath = pathSegments.slice(bucketIndex + 1).join('/'); 
            if (storagePath) {
                console.log(`Attempting to delete testimonial image from storage: ${storagePath}`);
                const { error: storageDeleteError } = await supabaseAdmin.storage
                    .from(bucketNameInPath) // Use your bucket name
                    .remove([storagePath]);
                
                if (storageDeleteError) {
                    console.error("Supabase Storage: Failed to delete image, but testimonial was deleted from DB:", storageDeleteError.message);
                } else {
                    console.log(`Successfully deleted image from storage: ${storagePath}`);
                }
            } else {
                 console.warn(`Could not determine a valid storage path to delete from URL: ${imageUrlString} for testimonial ID ${testimonialId}`);
            }
        } else {
            console.warn(`Could not determine storage path from URL: ${imageUrlString} for testimonial ID ${testimonialId}. Bucket name "${bucketNameInPath}" not found or path structure issue.`);
        }
      } catch (e: any) {
        // Catch errors from `new URL()` if imageUrlString is somehow invalid despite the check
        console.error("Error processing or deleting image from storage for testimonial:", e.message);
      }
    } else if (testimonialData && !testimonialData.image_url) {
        console.log(`Testimonial ID ${testimonialId} deleted from DB, no image_url was associated.`);
    } else {
        // This means the testimonial was not found by the initial SELECT (PGRST116 was true for fetchError)
        console.log(`Testimonial ID ${testimonialId} not found or already deleted prior to this operation. No storage action taken.`);
    }

    return NextResponse.json({ message: 'Testimonial deleted successfully!' }); // status 200 is default for successful NextResponse.json
  } catch (error: any) {
    console.error("Failed to delete testimonial (API Global Catch):", error.message);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}