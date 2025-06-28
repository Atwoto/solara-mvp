// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

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
        return supabase.storage.from('product-images').upload(filePath, file);
      });
      const uploadResults = await Promise.all(uploadPromises);

      // --- THIS IS THE BULLETPROOF FIX ---
      // Find the first result that has an error.
      const firstError = uploadResults.find(result => result.error);
      if (firstError) {
        // If we found one, we know its .error property exists and we can throw.
        throw new Error(`Failed to upload new image(s): ${firstError.error.message}`);
      }
      
      newImageUrls = uploadResults.map(result => {
        return supabase.storage.from('product-images').getPublicUrl(result.data!.path).data.publicUrl;
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
      { message: error.message || 'Failed to update product.' }, 
      { status: 500 }
    );
  }
}