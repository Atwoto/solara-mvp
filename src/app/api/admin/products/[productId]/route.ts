// src/app/api/admin/products/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product } from '@/types'; // It's still good to import this

// This is your PUT handler for updating a product
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
    const wattage = parseInt(formData.get('wattage') as string, 10);
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    // *** FIX: We are making the type of this object very clear to TypeScript ***
    // This removes the confusing '&' intersection type that caused the error.
    const dataToUpdate: { [key: string]: any } = {
      name,
      price,
      wattage,
      category,
      description,
    };
    
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null;

    if (imageFile) {
      const filePath = `product-image/${productId}/${Date.now()}-${imageFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-image')
        .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('product-image')
        .getPublicUrl(filePath);
      
      // Now this assignment will work without a type error.
      dataToUpdate.image_url = [urlData.publicUrl];

    } else if (currentImageUrl) {
      // This assignment will also work.
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