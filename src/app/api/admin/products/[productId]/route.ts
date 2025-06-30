// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PRODUCTS_IMAGE_BUCKET = 'product-images'; // Ensure this matches your bucket name

// --- GET Handler: Fetch a single product for the edit page ---
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = supabaseAdmin;
  const { productId } = params;

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
  }

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
      }
      throw error;
    }

    if (!product) {
        return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error: any) {
    console.error('Error fetching product:', error.message);
    return NextResponse.json({ message: `Error fetching product: ${error.message}` }, { status: 500 });
  }
}


// --- PUT Handler: Update an existing product ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = supabaseAdmin;
  const productId = params.productId;

  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const wattage = formData.get('wattage') ? parseFloat(formData.get('wattage') as string) : null;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;

    const imageFiles = formData.getAll('imageFiles') as File[];
    const currentImageUrls = formData.getAll('currentImageUrls') as string[];

    let newImageUrls: string[] = [];

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => {
        const fileExt = file.name.split('.').pop();
        const filePath = `public/${uuidv4()}.${fileExt}`;
        return supabase.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).upload(filePath, file);
      });
      const uploadResults = await Promise.all(uploadPromises);

      for (const result of uploadResults) {
        if (result.error) {
          throw new Error(`Failed to upload new image(s): ${result.error.message}`);
        }
      }
      
      newImageUrls = uploadResults.map(result => {
        return supabase.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).getPublicUrl(result.data!.path).data.publicUrl;
      });
    }

    const finalImageUrls = [...currentImageUrls, ...newImageUrls];

    const dataToUpdate = {
      name,
      price,
      wattage,
      category,
      description,
      image_url: finalImageUrls,
    };
    
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(dataToUpdate)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating product:', error);
      throw error;
    }

    return NextResponse.json({ 
      message: 'Product updated successfully!', 
      product: updatedProduct 
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to update product: ${error.message}` || 'An unexpected error occurred.' }, 
      { status: 500 }
    );
  }
}

// --- NEW: The DELETE handler to remove a product and its images ---
export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    const supabase = supabaseAdmin;
    const { productId } = params;

    if (!productId) {
        return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    try {
        // 1. Fetch the product to get its image URLs
        const { data: productToDelete, error: fetchError } = await supabase
            .from('products')
            .select('image_url')
            .eq('id', productId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "not found" errors, but throw others
            throw fetchError;
        }

        // 2. Delete the product from the database table
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (deleteError) {
            throw deleteError;
        }

        // 3. If the DB deletion was successful and there are images, delete them from storage
        if (productToDelete && productToDelete.image_url && productToDelete.image_url.length > 0) {
            const fileNames = productToDelete.image_url.map((url: string) => {
                // Extract the path after the bucket name, e.g., 'public/image.jpg'
                const urlParts = url.split(`/${SUPABASE_PRODUCTS_IMAGE_BUCKET}/`);
                return urlParts[1] || '';
            }).filter(Boolean); // Filter out any empty strings

            if (fileNames.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from(SUPABASE_PRODUCTS_IMAGE_BUCKET)
                    .remove(fileNames);
                
                if (storageError) {
                    // Log the error but don't fail the whole request, as the DB entry is already gone
                    console.warn(`Product record deleted, but failed to delete images from storage: ${storageError.message}`);
                }
            }
        }

        return NextResponse.json({ message: 'Product deleted successfully.' });

    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: `Failed to delete product: ${error.message}` }, { status: 500 });
    }
}