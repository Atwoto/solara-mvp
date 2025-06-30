// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_PRODUCTS_IMAGE_BUCKET = 'product-images';

// --- GET Handler (No changes needed) ---
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
    const { data: product, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
      throw error;
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: `Error fetching product: ${error.message}` }, { status: 500 });
  }
}

// --- PUT Handler (No changes needed) ---
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
        if (result.error) throw new Error(`Failed to upload new image(s): ${result.error.message}`);
      }
      newImageUrls = uploadResults.map(result => supabase.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).getPublicUrl(result.data!.path).data.publicUrl);
    }
    const finalImageUrls = [...currentImageUrls, ...newImageUrls];
    const dataToUpdate = { name, price, wattage, category, description, image_url: finalImageUrls };
    const { data: updatedProduct, error } = await supabase.from('products').update(dataToUpdate).eq('id', productId).select().single();
    if (error) throw error;
    return NextResponse.json({ message: 'Product updated successfully!', product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to update product: ${error.message}` }, { status: 500 });
  }
}

// --- UPDATED DELETE Handler to "Archive" a Product ---
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
        // Instead of deleting, we update the 'is_archived' flag to true.
        // This is a "soft delete".
        const { error } = await supabase
            .from('products')
            .update({ is_archived: true }) // The core change is here
            .eq('id', productId);

        if (error) {
            // The foreign key constraint error will no longer happen,
            // but we still check for other potential database errors.
            throw error;
        }

        // We no longer delete images from storage, as the product might be restored later.
        // The data is preserved.

        return NextResponse.json({ message: 'Product archived successfully.' });

    } catch (error: any) {
        console.error('Error archiving product:', error);
        return NextResponse.json({ message: `Failed to archive product: ${error.message}` }, { status: 500 });
    }
}