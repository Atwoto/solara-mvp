// src/components/admin/ProductForm.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent, ReactNode, useCallback } from 'react';
import { Product, PRODUCT_CATEGORY_SLUGS, ProductCategorySlug } from '@/types';
import { XCircleIcon, PhotoIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import TipTapEditor from '@/components/admin/TipTapEditor';

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'image_url'> & { 
  category: ProductCategorySlug | ''; 
  imageFiles: File[];
  currentImageUrls: string[];
};

interface ProductFormProps {
  initialData?: Product | null;
  onSubmitSuccess?: (message: string) => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const SettingsCard = ({ title, children, defaultOpen = true }: { title: string, children: ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <ChevronUpIcon className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ProductForm = ({ initialData, onSubmitSuccess }: ProductFormProps) => {
  const getInitialFormData = useCallback((): ProductFormData => ({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    wattage: initialData?.wattage || 0,
    category: (initialData?.category as ProductCategorySlug) || '',
    description: initialData?.description || '',
    imageFiles: [],
    currentImageUrls: initialData?.image_url || [],
  }), [initialData]);

  const [productData, setProductData] = useState<ProductFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setProductData(getInitialFormData());
    setImagePreviews([]);
  }, [initialData, getInitialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'wattage' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDescriptionChange = (richText: string) => {
    setProductData(prev => ({ ...prev, description: richText }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProductData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray] }));
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (productData.currentImageUrls.length === 0 && productData.imageFiles.length === 0) {
      setError("Please select at least one image for the product."); return;
    }
    
    setIsSubmitting(true); setError(null); setSuccessMessage(null);

    const formDataToSubmit = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'imageFiles' && key !== 'currentImageUrls' && value !== null && value !== undefined) {
        formDataToSubmit.append(key, String(value));
      }
    });
    productData.imageFiles.forEach(file => { formDataToSubmit.append('imageFiles', file); });
    productData.currentImageUrls.forEach(url => { formDataToSubmit.append('currentImageUrls', url); });

    try {
      const endpoint = initialData?.id ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
      const method = initialData?.id ? 'PUT' : 'POST';
      const response = await fetch(endpoint, { method: method, body: formDataToSubmit });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setSuccessMessage(result.message);
      if (onSubmitSuccess) onSubmitSuccess(result.message);

      if (!initialData) {
        setProductData(getInitialFormData());
        setImagePreviews([]);
      } else {
        const updatedProduct = result.product as Product;
        setProductData(prev => ({ ...prev, imageFiles: [], currentImageUrls: updatedProduct.image_url || [] }));
        setImagePreviews([]);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                        <input type="text" name="name" id="name" value={productData.name} onChange={handleInputChange} required className="block w-full text-2xl font-bold p-2 border-x-0 border-t-0 border-b-2 border-slate-200 focus:ring-0 focus:border-solar-flare-start transition-colors" placeholder="e.g., Bifacial Solar Panel"/>
                    </motion.div>
                    <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <TipTapEditor
                            content={productData.description || ''}
                            onChange={handleDescriptionChange}
                        />
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6 lg:sticky top-28">
                    <SettingsCard title="Pricing & Specs">
                        <div className="space-y-4">
                            <div><label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Ksh)</label><input type="number" name="price" id="price" value={productData.price} onChange={handleInputChange} required min="0" step="any" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
                            <div><label htmlFor="wattage" className="block text-sm font-medium text-gray-700 mb-1">Wattage (W)</label><input type="number" name="wattage" id="wattage" value={productData.wattage || ''} onChange={handleInputChange} min="0" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., 350" /></div>
                        </div>
                    </SettingsCard>

                    <SettingsCard title="Organization">
                        <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label><select name="category" id="category" value={productData.category} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm"><option value="" disabled>Select a category</option>{PRODUCT_CATEGORY_SLUGS.map(slug => (<option key={slug} value={slug}>{slug.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}</option>))}</select></div>
                    </SettingsCard>
                    
                    <SettingsCard title="Product Images">
                        <label htmlFor="imageFiles" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full min-h-[12rem] flex flex-col items-center justify-center text-center p-4">
                            <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <span className="mt-2 block text-sm font-semibold text-slate-600">Click to upload images</span>
                            <span className="block text-xs text-slate-500">PNG, JPG, GIF up to 5MB</span>
                            <input id="imageFiles" name="imageFiles" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/*" />
                        </label>
                        {(productData.currentImageUrls.length > 0 || imagePreviews.length > 0) && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {productData.currentImageUrls.map((url) => (
                                    <div key={url} className="relative group aspect-square"><img src={url} alt="Existing image" className="absolute inset-0 w-full h-full object-cover rounded-md border" loading="lazy" /><button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-white rounded-full transition-transform hover:scale-110"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button></div>
                                ))}
                                {imagePreviews.map((previewUrl, index) => (
                                    <div key={previewUrl} className="relative group aspect-square"><img src={previewUrl} alt="New preview" className="absolute inset-0 w-full h-full object-cover rounded-md border" loading="lazy" /><button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full transition-transform hover:scale-110"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button></div>
                                ))}
                            </div>
                        )}
                    </SettingsCard>
                </motion.div>
            </div>
            
            {/* The action bar is now inside the main motion.div wrapper */}
            <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-end max-w-7xl mx-auto">
                        <div className="flex-1 mr-4">
                            <AnimatePresence>
                                {error && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</motion.div>}
                                {successMessage && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</motion.div>}
                            </AnimatePresence>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-50 transition-opacity">
                            {isSubmitting ? <><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Saving...</> : (initialData?.id ? 'Update Product' : 'Create Product')}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div> {/* --- THIS IS THE FIX: Added the missing closing tag --- */}
    </form>
  );
};

export default ProductForm;
