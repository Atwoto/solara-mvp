// src/app/api/admin/products/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
// *** FIX 1: Import the 'supabaseAdmin' client that is actually exported. ***
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product } from '@/types';

// This is your PUT handler for updating a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  // *** FIX 2: Use the imported 'supabaseAdmin' client directly. ***
  const supabase = supabaseAdmin; 
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
      
      const { error: uploadError } = await supabase.storage
        .from('product-image') // Make sure this is your bucket name
        .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('product-image') // Make sure this is your bucket name
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