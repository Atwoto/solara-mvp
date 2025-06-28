// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// --- NEW: The GET handler to fetch a single product for the edit page ---
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
      .single(); // Use .single() to get one object, not an array

    if (error) {
      if (error.code === 'PGRST116') { // Code for "No rows found"
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


// --- EXISTING: The PUT handler for updating a product ---
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

      for (const result of uploadResults) {
        if (result.error) {
          throw new Error(`Failed to upload new image(s): ${result.error.message}`);
        }
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
      { message: error.message || 'Failed. Please check server logs.' }, 
      { status: 500 }
    );
  }
}