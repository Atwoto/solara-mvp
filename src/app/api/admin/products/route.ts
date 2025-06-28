// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type ProductCategory = string;

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized.");
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  let uploadedImagePath: string | null = null;

  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const priceString = formData.get('price') as string;
    const wattageString = formData.get('wattage') as string | null;
    const category = formData.get('category') as ProductCategory;
    const description = formData.get('description') as string | null;
    const imageFile = formData.get('imageFile') as File | null;

    if (!name || !priceString || !category || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const price = parseFloat(priceString);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ message: 'Invalid price.' }, { status: 400 });
    }

    let wattage: number | null = null;
    if (wattageString) {
      const parsedWattage = parseFloat(wattageString);
      if (!isNaN(parsedWattage) && parsedWattage >= 0) {
        wattage = parsedWattage;
      } else if (wattageString.trim() !== "") {
        return NextResponse.json({ message: 'Invalid wattage.' }, { status: 400 });
      }
    }

    const fileExt = imageFile.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const filePath = `public/${uniqueFileName}`;
    uploadedImagePath = filePath;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images') // YOUR BUCKET NAME
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images') // YOUR BUCKET NAME
      .getPublicUrl(uploadData.path);
      
    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded image.');
    }
    const imageUrl = publicUrlData.publicUrl;

    // *** THIS IS THE FIX: Wrap the single URL in an array ***
    const productToInsert: Omit<Product, 'id' | 'created_at'> = {
      name,
      price,
      wattage,
      image_url: [imageUrl], // <-- CORRECTED
      category,
      description: description || null,
    };

    const { data: insertedProductData, error: insertError } = await supabaseAdmin
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (insertError) {
      if (uploadedImagePath) {
         await supabaseAdmin.storage.from('product-images').remove([uploadedImagePath]);
      }
      throw new Error(`Failed to add product to database: ${insertError.message}`);
    }
    
    return NextResponse.json({ message: 'Product added successfully!', product: insertedProductData }, { status: 201 });

  } catch (error: any) {
    if (uploadedImagePath) {
        try {
            await supabaseAdmin.storage.from('product-images').remove([uploadedImagePath]);
        } catch (cleanupError: any) {
            console.error("Failed to rollback storage upload:", cleanupError.message);
        }
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}