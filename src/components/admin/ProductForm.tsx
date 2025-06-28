// src/components/admin/ProductForm.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { Product, PRODUCT_CATEGORY_SLUGS, ProductCategorySlug } from '@/types';
import Image from 'next/image';
import { XCircleIcon } from '@heroicons/react/24/solid';

// --- STATE UPGRADE ---
// We now handle arrays for images
export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'image_url'> & { 
  category: ProductCategorySlug | ''; 
  imageFiles: File[]; // From single 'File' to array 'File[]'
  currentImageUrls: string[]; // From single 'string' to array 'string[]'
};

interface ProductFormProps {
  initialData?: Product | null;
  onSubmitSuccess?: (message: string) => void;
}

const ProductForm = ({ initialData, onSubmitSuccess }: ProductFormProps) => {
  const getInitialFormData = (): ProductFormData => ({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    wattage: initialData?.wattage || 0,
    category: (initialData?.category as ProductCategorySlug) || '',
    description: initialData?.description || '',
    imageFiles: [], // Start with an empty array for new files
    currentImageUrls: initialData?.image_url || [], // Use the existing array of URLs
  });

  const [productData, setProductData] = useState<ProductFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =useState<string | null>(null);
  
  // Preview state is now also an array of strings (for data URLs)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setProductData(getInitialFormData());
    setImagePreviews([]); // Reset previews on initial data change
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'wattage' ? parseFloat(value) || 0 : value,
    }));
  };

  // --- UPGRADED FILE HANDLER ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProductData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray] }));

      // Create previews for newly added files
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setProductData(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (urlToRemove: string) => {
    setProductData(prev => ({ ...prev, currentImageUrls: prev.currentImageUrls.filter(url => url !== urlToRemove) }));
  };

  // --- UPGRADED SUBMIT HANDLER ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (productData.currentImageUrls.length === 0 && productData.imageFiles.length === 0) {
      setError("Please select at least one image for the product.");
      return;
    }
    // ... other validations
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formDataToSubmit = new FormData();
    // Append all regular fields
    formDataToSubmit.append('name', productData.name);
    formDataToSubmit.append('price', productData.price.toString());
    formDataToSubmit.append('wattage', productData.wattage?.toString() || '0');
    formDataToSubmit.append('category', productData.category);
    formDataToSubmit.append('description', productData.description || '');

    // Append all NEW image files
    productData.imageFiles.forEach(file => {
      formDataToSubmit.append('imageFiles', file); // Plural key: 'imageFiles'
    });

    // Append the list of REMAINING existing URLs
    productData.currentImageUrls.forEach(url => {
        formDataToSubmit.append('currentImageUrls', url); // Plural key
    });

    try {
      const endpoint = initialData?.id ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        body: formDataToSubmit,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setSuccessMessage(result.message);
      // Logic to reset form or redirect...
      if (!initialData) { // If it was a new product, fully reset
        setProductData(getInitialFormData());
        setImagePreviews([]);
      } else { // If it was an update, refresh the form state with new data
        const updatedProduct = result.product as Product;
        setProductData(prev => ({
          ...prev,
          imageFiles: [], // Clear staged files
          currentImageUrls: updatedProduct.image_url || [], // Set new list of URLs
        }));
        setImagePreviews([]); // Clear previews
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
      {/* Error/Success messages here */}
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{error}</div>}
      {successMessage && <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">{successMessage}</div>}

      {/* Other form fields like name, price, etc. remain the same */}
      <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input type="text" name="name" id="name" value={productData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Ksh)</label><input type="number" name="price" id="price" value={productData.price} onChange={handleInputChange} required min="0" step="any" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div><div><label htmlFor="wattage" className="block text-sm font-medium text-gray-700 mb-1">Wattage (W)</label><input type="number" name="wattage" id="wattage" value={productData.wattage || ''} onChange={handleInputChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., 350" /></div></div>
      <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label><select name="category" id="category" value={productData.category} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm"><option value="" disabled>Select a category</option>{PRODUCT_CATEGORY_SLUGS.map(slug => (<option key={slug} value={slug}>{slug.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}</option>))}</select></div>

      {/* --- UPGRADED IMAGE UPLOAD UI --- */}
      <div>
        <label htmlFor="imageFiles" className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
        
        {/* Display existing images */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
          {productData.currentImageUrls.map((url) => (
            <div key={url} className="relative group">
              <Image src={url} alt="Existing product image" width={100} height={100} className="w-full h-auto object-cover rounded-md border" />
              <button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-white rounded-full">
                <XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Display new image previews */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
          {imagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative group">
              <Image src={previewUrl} alt={`New image preview ${index + 1}`} width={100} height={100} className="w-full h-auto object-cover rounded-md border" />
              <button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full">
                <XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>

        <input 
          type="file" 
          name="imageFiles" 
          id="imageFiles" 
          onChange={handleFileChange} 
          multiple // <-- The crucial attribute!
          accept="image/png, image/jpeg, image/webp, image/gif" 
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer" 
        />
        <p className="mt-1 text-xs text-gray-500">You can select multiple files. Max 2MB per file.</p>
      </div>

      <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" id="description" rows={5} value={productData.description || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="Detailed product description..."></textarea></div>
      <div><button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-60 transition-opacity">{isSubmitting ? (initialData?.id ? 'Updating...' : 'Adding...') : (initialData?.id ? 'Update Product' : 'Add Product')}</button></div>
    </form>
  );
};

export default ProductForm;