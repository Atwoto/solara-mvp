// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';// Use the admin client
import { Product } from '@/types'; // Import only Product for now
import { v4 as uuidv4 } from 'uuid'; // For unique file names

// Define ProductCategory inline if it's not available in types
type ProductCategory = string; // or whatever your category type should be
// Alternative: you could use a union type like:
// type ProductCategory = 'solar-panels' | 'inverters' | 'batteries' | 'accessories';

// Optional: For more robust backend session/role validation for admin actions
// import { getToken } from 'next-auth/jwt';
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Ensure ADMIN_EMAIL is in your .env / .env.local

export async function POST(req: NextRequest) {
  // Optional: Backend authorization check
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // if (!token || token.email !== ADMIN_EMAIL) {
  //   return NextResponse.json({ message: 'Unauthorized: Admin access required.' }, { status: 401 });
  // }

  if (!supabaseAdmin) {
    console.error("Supabase admin client is not initialized. Check server logs and SUPABASE_SERVICE_ROLE_KEY environment variable.");
    return NextResponse.json({ message: 'Server configuration error: Supabase admin client not available.' }, { status: 500 });
  }

  let uploadedImagePath: string | null = null; // To keep track for potential rollback

  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const priceString = formData.get('price') as string;
    const wattageString = formData.get('wattage') as string | null;
    const category = formData.get('category') as ProductCategory;
    const description = formData.get('description') as string | null;
    const imageFile = formData.get('imageFile') as File | null;

    // --- Validation ---
    if (!name || !priceString || !category || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields: name, price, category, and imageFile are required.' }, { status: 400 });
    }

    const price = parseFloat(priceString);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ message: 'Invalid price provided.' }, { status: 400 });
    }

    let wattage: number | null = null;
    if (wattageString) {
      const parsedWattage = parseFloat(wattageString);
      if (!isNaN(parsedWattage) && parsedWattage >= 0) {
        wattage = parsedWattage;
      } else if (wattageString.trim() !== "") { // only error if it's not empty but invalid
        return NextResponse.json({ message: 'Invalid wattage provided.' }, { status: 400 });
      }
    }
    // --- End Validation ---


    // 1. Upload image to Supabase Storage
    const fileExt = imageFile.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    // It's good practice to organize uploads, e.g., by year/month or by entity type
    const filePath = `public/${uniqueFileName}`; // Storing in 'public' folder within the bucket for direct public URLs
    uploadedImagePath = filePath; // Store for potential rollback

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images') // <<--- YOUR BUCKET NAME HERE
      .upload(filePath, imageFile, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, 
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
        throw new Error('Image upload succeeded but no path was returned from storage.');
    }
    
    // 2. Get the public URL of the uploaded image
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images') // <<--- YOUR BUCKET NAME HERE
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
        console.error("Could not get public URL for uploaded image path:", uploadData.path);
        // Attempt to remove the uploaded file if getting URL fails
        await supabaseAdmin.storage.from('product-images').remove([uploadData.path]);
        uploadedImagePath = null; // Clear path as it's been removed
        throw new Error('Failed to get public URL for the uploaded image.');
    }
    const imageUrl = publicUrlData.publicUrl;

    // 3. Insert product data into the 'products' table
    // Supabase will generate 'id' and 'created_at' if columns are configured correctly
    const productToInsert: Omit<Product, 'id' | 'created_at'> = {
      name,
      price,
      wattage, // Will be null if not provided or invalid
       image_url: imageUrl,
      category,
      description: description || null, // Ensure null if empty string and DB expects null
    };

    const { data: insertedProductData, error: insertError } = await supabaseAdmin
      .from('products') // Your database table name
      .insert([productToInsert])
      .select() // Select all columns of the newly inserted row
      .single(); // We expect a single row to be returned

    if (insertError) {
      console.error('Supabase DB insert error:', insertError);
      // If DB insert fails, try to remove the uploaded image from storage
      if (uploadedImagePath) { // Check if we have a path to remove
         await supabaseAdmin.storage.from('product-images').remove([uploadedImagePath]);
         uploadedImagePath = null;
      }
      throw new Error(`Failed to add product to database: ${insertError.message}`);
    }
    
    if (!insertedProductData) {
        // This case should ideally not happen if insertError is null, but good to check
        if (uploadedImagePath) {
             await supabaseAdmin.storage.from('product-images').remove([uploadedImagePath]);
             uploadedImagePath = null;
        }
        throw new Error("Product data was not returned after insert into database, though no explicit error was thrown.");
    }

    // The insertedProductData should now conform to the Product type
    const newProduct = insertedProductData as unknown as Product;

    return NextResponse.json({ message: 'Product added successfully!', product: newProduct }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to add product (API Global Catch):", error);
    // If an image was uploaded but a subsequent error occurred (e.g., DB insert fails after URL retrieval)
    // and wasn't cleaned up yet, try to clean it up here.
    // This is a last-ditch effort for cleanup.
    if (uploadedImagePath && error.message !== `Failed to upload image: ${error.message}` && error.message !== 'Failed to get public URL for the uploaded image.') {
        try {
            console.warn("Attempting to rollback storage upload due to error:", uploadedImagePath);
            await supabaseAdmin.storage.from('product-images').remove([uploadedImagePath]);
        } catch (cleanupError: any) {
            console.error("Failed to rollback storage upload:", cleanupError.message);
        }
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}