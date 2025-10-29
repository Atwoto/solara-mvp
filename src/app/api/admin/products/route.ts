// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Product } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const wattage = formData.get("wattage")
      ? parseFloat(formData.get("wattage") as string)
      : null;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;
    const featuresJson = formData.get("featuresJson") as string | null; // --- 1. GET THE JSON STRING ---

    // Get sold_count and rating (nullable fields)
    const soldCountStr = formData.get("sold_count") as string | null;
    const ratingStr = formData.get("rating") as string | null;
    const sold_count =
      soldCountStr && soldCountStr !== "" ? parseInt(soldCountStr) : null;
    const rating = ratingStr && ratingStr !== "" ? parseFloat(ratingStr) : null;

    const imageFiles = formData.getAll("imageFiles") as File[];

    if (!name || !price || !category || imageFiles.length === 0) {
      return NextResponse.json(
        {
          message:
            "Missing required fields. Name, price, category, and at least one image are required.",
        },
        { status: 400 }
      );
    }

    // --- 2. PARSE THE JSON STRING ---
    // Safely parse the features JSON. If it's empty or invalid, default to an empty array.
    let features = [];
    if (featuresJson) {
      try {
        features = JSON.parse(featuresJson);
      } catch (error) {
        console.error("Invalid JSON for features:", featuresJson);
        return NextResponse.json(
          {
            message:
              "The format for the features is invalid. Please provide a valid JSON.",
          },
          { status: 400 }
        );
      }
    }

    const uploadPromises = imageFiles.map((file) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `public/${uuidv4()}.${fileExt}`;
      return supabaseAdmin.storage
        .from("product-images")
        .upload(filePath, file);
    });

    const uploadResults = await Promise.all(uploadPromises);

    for (const result of uploadResults) {
      if (result.error) {
        const successfulPaths = uploadResults
          .filter((r) => r.data?.path)
          .map((r) => r.data!.path);
        if (successfulPaths.length > 0) {
          await supabaseAdmin.storage
            .from("product-images")
            .remove(successfulPaths);
        }
        throw new Error(
          `Failed to upload one or more images: ${result.error.message}`
        );
      }
    }

    const imageUrls = uploadResults.map((result) => {
      return supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(result.data!.path).data.publicUrl;
    });

    // --- 3. ADD FEATURES TO THE PRODUCT DATA ---
    // The 'features' field is now included in the object to be inserted.
    const productToInsert: Omit<Product, "id" | "created_at"> = {
      name,
      price,
      wattage,
      image_url: imageUrls,
      category,
      description: description || null,
      features, // Added the parsed features array here
      sold_count, // Add sold_count
      rating, // Add rating
    };

    const { data: insertedProductData, error: insertError } =
      await supabaseAdmin
        .from("products")
        .insert([productToInsert])
        .select()
        .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      { message: "Product added successfully!", product: insertedProductData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/admin/products:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
