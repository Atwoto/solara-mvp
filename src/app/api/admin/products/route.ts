// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const wattage = formData.get('wattage') ? parseFloat(formData.get('wattage') as string) : null;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;
    
    const imageFiles = formData.getAll('imageFiles') as File[];

    if (!name || !price || !category || imageFiles.length === 0) {
      return NextResponse.json({ message: 'Missing required fields. Name, price, category, and at least one image are required.' }, { status: 400 });
    }

    const uploadPromises = imageFiles.map(file => {
      const fileExt = file.name.split('.').pop();
      const filePath = `public/${uuidv4()}.${fileExt}`;
      return supabaseAdmin.storage.from('product-images').upload(filePath, file);
    });

    const uploadResults = await Promise.all(uploadPromises);

    // --- THE GUARANTEED FIX ---
    for (const result of uploadResults) {
        if (result.error) {
            // If an error occurred, attempt to clean up any files that did succeed.
            const successfulPaths = uploadResults
                .filter(r => r.data?.path)
                .map(r => r.data!.path);
            if (successfulPaths.length > 0) {
                await supabaseAdmin.storage.from('product-images').remove(successfulPaths);
            }
            throw new Error(`Failed to upload one or more images: ${result.error.message}`);
        }
    }

    const imageUrls = uploadResults.map(result => {
        return supabaseAdmin.storage.from('product-images').getPublicUrl(result.data!.path).data.publicUrl;
    });

    const productToInsert: Omit<Product, 'id' | 'created_at'> = {
      name,
      price,
      wattage,
      image_url: imageUrls,
      category,
      description: description || null,
    };

    const { data: insertedProductData, error: insertError } = await supabaseAdmin
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    
    return NextResponse.json({ message: 'Product added successfully!', product: insertedProductData }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}