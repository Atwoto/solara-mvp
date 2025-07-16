// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';
const SUPABASE_PRODUCTS_IMAGE_BUCKET = 'product-images';

// GET Handler for a single product (No changes needed here)
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  // ... (existing code is correct)
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { productId } = params;
  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
  }
  try {
    const { data: product, error } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
      throw error;
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: `Error fetching product: ${error.message}` }, { status: 500 });
  }
}

// PUT Handler for updating a product (MODIFIED)
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { productId } = params;
  try {
    const formData = await request.formData();
    
    // Create an object with all fields from the form
    const dataToUpdate: { [key: string]: any } = {
        name: formData.get('name') as string,
        price: parseFloat(formData.get('price') as string),
        wattage: formData.get('wattage') ? parseFloat(formData.get('wattage') as string) : null,
        category: formData.get('category') as string,
        description: formData.get('description') as string | null,
    };
    
    // --- 1. GET AND PARSE FEATURES JSON ---
    // Get the featuresJson string from the form data.
    const featuresJson = formData.get('featuresJson') as string | null;

    // Safely parse it and add it to our dataToUpdate object.
    if (featuresJson) {
        try {
            dataToUpdate.features = JSON.parse(featuresJson);
        } catch (error) {
            console.error("Invalid JSON for features:", featuresJson);
            return NextResponse.json({ message: 'The format for the features is invalid. Please provide a valid JSON.' }, { status: 400 });
        }
    }
    // --- END OF CHANGES ---

    const imageFiles = formData.getAll('imageFiles') as File[];
    const currentImageUrls = formData.getAll('currentImageUrls') as string[];
    let newImageUrls: string[] = [];

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => {
        const fileExt = file.name.split('.').pop();
        const filePath = `public/${uuidv4()}.${fileExt}`;
        return supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).upload(filePath, file);
      });
      const uploadResults = await Promise.all(uploadPromises);

      for (const result of uploadResults) {
        if (result.error) throw new Error(`Failed to upload new image(s): ${result.error.message}`);
      }
      newImageUrls = uploadResults.map(result => supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).getPublicUrl(result.data!.path).data.publicUrl);
    }
    
    dataToUpdate.image_url = [...currentImageUrls, ...newImageUrls];

    // The 'features' field will now be included in the update if it was provided.
    const { data: updatedProduct, error } = await supabaseAdmin.from('products').update(dataToUpdate).eq('id', productId).select().single();
    
    if (error) throw error;

    return NextResponse.json({ message: 'Product updated successfully!', product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to update product: ${error.message}` }, { status: 500 });
  }
}

// DELETE Handler to "Archive" a Product (No changes needed here)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    // ... (existing code is correct)
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== ADMIN_EMAIL) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    const { productId } = params;
    if (!productId) {
        return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from('products')
            .update({ is_archived: true })
            .eq('id', productId);

        if (error) throw error;

        return NextResponse.json({ message: 'Product archived successfully.' });

    } catch (error: any) {
        console.error('Error archiving product:', error);
        return NextResponse.json({ message: `Failed to archive product: ${error.message}` }, { status: 500 });
    }
}