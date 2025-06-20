// src/app/api/admin/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { Product } from '@/types';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';
const SUPABASE_PRODUCTS_IMAGE_BUCKET = 'product-images';

interface RouteParams {
  params: {
    productId: string;
  };
}

// --- GET Handler (from previous step - should be fine) ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) { /* ... */ return NextResponse.json({ message: 'Unauthorized' }, { status: 403 }); }
  if (!supabaseAdmin) { /* ... */ return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });}
  if (!productId) { /* ... */ return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });}

  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      console.error('API: Supabase error GET product:', JSON.stringify(error, null, 2));
      return NextResponse.json({ message: 'Database error', error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(data as Product);
  } catch (error: any) { /* ... */ return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 }); }
}


// --- PUT Handler: Update an existing product ---
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { productId } = params;
  console.log(`API: PUT /api/admin/products/${productId} hit`);

  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required for update' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string | null;
    const priceString = formData.get('price') as string | null;
    const wattageString = formData.get('wattage') as string | null;
    const category = formData.get('category') as string | null;
    const description = formData.get('description') as string | null;
    const imageFile = formData.get('imageFile') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string | null;

    if (!name || !priceString || !category) {
      return NextResponse.json({ message: 'Missing required fields: name, price, and category are required.' }, { status: 400 });
    }

    const price = parseFloat(priceString);
    const wattage = wattageString && wattageString.trim() !== '' ? parseFloat(wattageString) : null; // Handle empty string for wattage
    if (isNaN(price) || (wattageString && wattageString.trim() !== '' && isNaN(wattage as number))) {
        return NextResponse.json({ message: 'Invalid number format for price or wattage.' }, { status: 400 });
    }

    let newImageUrl: string | undefined | null = currentImageUrl || undefined; // Start with current, undefined means no change unless new file or cleared

    if (imageFile) {
        if (currentImageUrl) {
            try {
                const oldFileNameWithFolder = new URL(currentImageUrl).pathname.split('/').slice(4).join('/');
                if (oldFileNameWithFolder) {
                    await supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).remove([oldFileNameWithFolder]);
                }
            } catch (e) { console.warn("API: Error parsing/deleting old product image URL:", e); }
        }
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `public/${fileName}`; 
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(SUPABASE_PRODUCTS_IMAGE_BUCKET).upload(filePath, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type });
        if (uploadError) {
            console.error('API: Supabase storage upload error:', JSON.stringify(uploadError, null, 2));
            return NextResponse.json({ message: 'Failed to upload new product image.', error: uploadError.message }, { status: 500 });
        }
        newImageUrl = supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
    } else if (formData.has('currentImageUrl') && !currentImageUrl) { 
        // This means currentImageUrl was sent as an empty string (or was null) and no new file, signifying "remove current image"
        newImageUrl = null;
        // We need the original URL to delete from storage if the form explicitly cleared it
        // This requires fetching the product's current imageUrl first if not already available
        const { data: productBeforeUpdate } = await supabaseAdmin.from('products').select('imageUrl').eq('id', productId).single();
        if (productBeforeUpdate?.imageUrl) {
            try {
                const oldFileNameWithFolder = new URL(productBeforeUpdate.imageUrl).pathname.split('/').slice(4).join('/');
                if (oldFileNameWithFolder) {
                    await supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).remove([oldFileNameWithFolder]);
                     console.log("API: Explicitly removed product image from storage.");
                }
            } catch (e) { console.warn("API: Error deleting image on explicit clear:", e); }
        }
    }

    // Construct the object with fields to update
    const productToUpdate: Partial<Product> = {}; // Use Partial<Product>
    if (name) productToUpdate.name = name;
    productToUpdate.price = price; // Price is required
    productToUpdate.wattage = wattage; // Handles null correctly
    if (category) productToUpdate.category = category;
    if (description !== null) productToUpdate.description = description; // Allow empty string for description
    
    // Only set imageUrl if it has actually changed (new upload or explicit removal)
    if (newImageUrl !== undefined) { 
        productToUpdate.imageUrl = newImageUrl;
    }
    // DO NOT manually set updated_at if your database has a trigger for it.
    // If no trigger, then: productToUpdate.updated_at = new Date().toISOString();

    console.log("API: Data to update product in Supabase:", JSON.stringify(productToUpdate, null, 2));
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('products')
      .update(productToUpdate)
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
        console.error('API: Supabase error updating product:', JSON.stringify(updateError, null, 2));
        return NextResponse.json({ message: 'Failed to update product.', error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product updated successfully!', product: updatedData });
  } catch (error: any) {
    console.error('API: Unhandled error updating product:', error.message, error.stack);
    return NextResponse.json({ message: 'Unexpected server error during product update.', error: error.message }, { status: 500 });
  }
}

// --- DELETE Handler (from previous step - ensure it's complete and correct) ---
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    // ... (Your existing DELETE logic)
    const { productId } = params;
    const session = await getServerSession(authOptions) as Session | null;
    if (!session || !session.user || session.user.email !== ADMIN_EMAIL) { /* ... */ }
    if (!supabaseAdmin) { /* ... */ }
    if (!productId) { /* ... */ }

    try {
        const { data: productToDelete, error: fetchErr } = await supabaseAdmin
            .from('products').select('imageUrl').eq('id', productId).single();
        
        const { error: deleteDbError } = await supabaseAdmin.from('products').delete().eq('id', productId);
        if (deleteDbError) { /* ... */ }

        if (productToDelete?.imageUrl) {
            try {
                const imageUrlPath = new URL(productToDelete.imageUrl).pathname;
                const pathParts = imageUrlPath.split('/');
                const filePathInBucket = pathParts.slice(pathParts.indexOf(SUPABASE_PRODUCTS_IMAGE_BUCKET) + 1).join('/');
                if (filePathInBucket) {
                    await supabaseAdmin.storage.from(SUPABASE_PRODUCTS_IMAGE_BUCKET).remove([filePathInBucket]); 
                }
            } catch (e) { /* ... */ }
        }
        return NextResponse.json({ message: 'Product deleted successfully.' });
    } catch (error: any) { /* ... */ }
}