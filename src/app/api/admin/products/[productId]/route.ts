// src/app/api/admin/products/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
// *** THE FIX IS HERE: Correct this import path to match your project's structure! ***
// Look for where you define your Supabase server client and use that path.
import { createClient } from '@/utils/supabase/server'; // <--- CHANGE THIS LINE
import { Product } from '@/types';

// This is your PUT handler for updating a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient();
  const productId = params.productId;

  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const wattage = parseInt(formData.get('wattage') as string, 10);
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    const dataToUpdate: Partial<Product> & { image_url?: string[] } = {
      name,
      price,
      wattage,
      category,
      description,
    };
    
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null;

    if (imageFile) {
      // Logic to upload a new image and get its URL
      const filePath = `product-image/${productId}/${Date.now()}-${imageFile.name}`;
      
      // *** IMPORTANT: Make sure to replace 'your-bucket-name' with your actual Supabase storage bucket name! ***
      const { error: uploadError } = await supabase.storage
        .from('product-image') // <== REPLACE with your bucket name if different
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('product-image') // <== REPLACE with your bucket name if different
        .getPublicUrl(filePath);
      
      dataToUpdate.image_url = [urlData.publicUrl]; // Wrap the new URL in an array

    } else if (currentImageUrl) {
      // This wraps the existing image URL string in an array to match the database
      dataToUpdate.image_url = [currentImageUrl]; 
    }
    
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