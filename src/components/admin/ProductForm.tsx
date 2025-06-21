// src/components/admin/ProductForm.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Product, PRODUCT_CATEGORY_SLUGS, ProductCategorySlug } from '@/types';
import Image from 'next/image';

// *** FIX #1: Omit 'image_url' instead of 'imageUrl'. ***
export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'image_url'> & { 
  category: ProductCategorySlug | ''; 
  imageFile?: File | null; 
  currentImageUrl?: string | null;
};

interface ProductFormProps {
  initialData?: Product | null;
  onSubmitSuccess?: (message: string) => void;
}

const ProductForm = ({ initialData, onSubmitSuccess }: ProductFormProps) => {
  const router = useRouter();

  const getInitialFormData = (): ProductFormData => ({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    wattage: initialData?.wattage || 0,
    category: (initialData?.category as ProductCategorySlug) || '',
    description: initialData?.description || '',
    imageFile: null,
    // *** FIX #2: Use 'image_url' from initialData. ***
    currentImageUrl: initialData?.image_url || null,
  });

  // *** FIX #3: Use 'image_url' for initial state. ***
  const [productData, setProductData] = useState<ProductFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);

  useEffect(() => {
    // *** FIX #4: Use 'image_url' when resetting form. ***
    setProductData(getInitialFormData());
    setImagePreview(initialData?.image_url || null);
  }, [initialData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'wattage' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) { setError('Invalid image type.'); e.target.value = ''; return; }
      if (file.size > 2 * 1024 * 1024) { setError('Image too large (max 2MB).'); e.target.value = ''; return; }
      setError(null);

      setProductData(prev => ({ ...prev, imageFile: file, currentImageUrl: null }));
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setProductData(prev => ({ ...prev, imageFile: null }));
      // *** FIX #5: Use 'image_url' when reverting. ***
      setImagePreview(initialData?.image_url || null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initialData && !productData.imageFile) {
      setError("Please select an image for the new product.");
      return;
    }
    if (!productData.category) { setError("Please select a category."); return; }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', productData.name);
    formDataToSubmit.append('price', productData.price.toString());
    formDataToSubmit.append('wattage', productData.wattage?.toString() || '0');
    formDataToSubmit.append('category', productData.category);
    formDataToSubmit.append('description', productData.description || '');
    
    if (productData.imageFile) {
      formDataToSubmit.append('imageFile', productData.imageFile);
    }
    if (initialData && productData.currentImageUrl && !productData.imageFile) {
        formDataToSubmit.append('currentImageUrl', productData.currentImageUrl);
    }


    try {
      const endpoint = initialData?.id 
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        body: formDataToSubmit, 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${initialData?.id ? 'update' : 'add'} product`);
      }

      const successMsg = result.message || `Product ${initialData?.id ? 'updated' : 'added'} successfully!`;
      setSuccessMessage(successMsg);

      if (onSubmitSuccess) {
        onSubmitSuccess(successMsg);
      } else {
        if (!initialData) {
            setProductData(getInitialFormData()); 
            setImagePreview(null);
            const fileInput = document.getElementById('imageFile') as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } else if (result.product) {
            const updatedProduct = result.product as Product;
            // *** FIX #6: Use 'image_url' when updating state after submission. ***
            setProductData(prev => ({
                ...prev,
                currentImageUrl: updatedProduct.image_url,
                imageFile: null,
            }));
            setImagePreview(updatedProduct.image_url || null);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
        {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
        {successMessage && <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">{successMessage}</div>}

        <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input type="text" name="name" id="name" value={productData.name} onChange={handleInputChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Ksh)</label>
            <input type="number" name="price" id="price" value={productData.price} onChange={handleInputChange} required min="0" step="any"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
        </div>
        <div>
            <label htmlFor="wattage" className="block text-sm font-medium text-gray-700 mb-1">Wattage (W)</label>
            <input type="number" name="wattage" id="wattage" value={productData.wattage || ''} onChange={handleInputChange} min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., 350" />
        </div>
        </div>
        
        <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select name="category" id="category" value={productData.category} onChange={handleInputChange} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
            <option value="" disabled>Select a category</option>
            {PRODUCT_CATEGORY_SLUGS.map(slugValue => (
            <option key={slugValue} value={slugValue}>
                {slugValue.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
            ))}
        </select>
        </div>

        <div>
        <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
            Product Image {initialData?.id ? "(Upload to replace current)" : ""}
        </label>
        {imagePreview && (
            <div className="mt-2 mb-2">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <Image src={imagePreview} alt="Product image preview" width={160} height={160} className="h-40 w-auto object-contain border rounded-md p-1 bg-gray-50"/>
            </div>
        )}
        <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp, image/gif" 
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer" />
        <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Recommended: 800x800px.</p>
        </div>

        <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" id="description" rows={5} value={productData.description || ''} onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="Detailed product description..."></textarea>
        </div>

        <div>
        <button type="submit" disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-60 transition-opacity">
            {isSubmitting ? (initialData?.id ? 'Updating...' : 'Adding...') : (initialData?.id ? 'Update Product' : 'Add Product')}
        </button>
        </div>
    </form>
  );
};

export default ProductForm;