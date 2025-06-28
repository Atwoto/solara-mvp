// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = supabaseAdmin;
  const productId = params.productId;

  try {
    const formData = await request.formData();
    
    // --- Get form data ---
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const wattage = formData.get('wattage') ? parseFloat(formData.get('wattage') as string) : null;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;

    // --- UPGRADE: Get arrays of new files and existing URLs ---
    const imageFiles = formData.getAll('imageFiles') as File[];
    const currentImageUrls = formData.getAll('currentImageUrls') as string[];

    let newImageUrls: string[] = [];

    // --- 1. Handle new file uploads ---
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => {
        const fileExt = file.name.split('.').pop();
        const filePath = `public/${uuidv4()}.${fileExt}`;
        return supabase.storage.from('product-images').upload(filePath, file);
      });
      const uploadResults = await Promise.all(uploadPromises);

      const uploadErrors = uploadResults.filter(result => result.error);
      if (uploadErrors.length > 0) {
          throw new Error(`Failed to upload new image(s): ${uploadErrors[0].error.message}`);
      }
      
      newImageUrls = uploadResults.map(result => {
        return supabase.storage.from('product-images').getPublicUrl(result.data!.path).data.publicUrl;
      });
    }

    // --- 2. Combine old and new URLs for the final array ---
    const finalImageUrls = [...currentImageUrls, ...newImageUrls];

    // --- 3. Construct the update object ---
    const dataToUpdate = {
      name,
      price,
      wattage,
      category,
      description,
      image_url: finalImageUrls, // <-- The final, combined array
    };
    
    // --- 4. Update the database ---
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
      { message: error.message || 'Failed to update product.' }, 
      { status: 500 }
    );
  }
}