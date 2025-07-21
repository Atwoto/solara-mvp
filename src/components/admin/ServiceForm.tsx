'use client';

import { useState, useEffect, FormEvent, ChangeEvent, ReactNode, useCallback, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/admin/TipTapEditor';
import { ServicePageData, ServiceCategory } from '@/types';
// import Image from 'next/image'; // Assuming this was also meant to be un-optimized
import { XCircleIcon, PhotoIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';


interface ServiceFormProps {
  initialData?: ServicePageData | null;
  onSubmitSuccess?: () => void;
}

const statusOptions: ServicePageData['status'][] = ['draft', 'published', 'archived'];

type ServiceFormState = Omit<ServicePageData, 'id' | 'created_at' | 'updated_at' | 'image_urls' | 'features'> & {
    featuresJson: string;
    imageFiles: File[];
    currentImageUrls: string[];
};

// A reusable component for the collapsible sidebar sections
const SettingsCard = ({ title, children }: { title: string, children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);
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

// A new recursive helper function to render nested options for the dropdown
const renderCategoryOptions = (categories: ServiceCategory[], allCategories: ServiceCategory[], level = 0) => {
    const prefix = '\u00A0\u00A0'.repeat(level) + (level > 0 ? '↳ ' : '');
    return categories.map(category => {
        const children = allCategories.filter(c => c.parent_id === category.id)
            .sort((a, b) => a.display_order - b.display_order); // Sort children by display order
        return (
            <Fragment key={category.id}>
                <option value={category.slug}>
                    {prefix}{category.name}
                </option>
                {children.length > 0 && renderCategoryOptions(children, allCategories, level + 1)}
            </Fragment>
        );
    });
};

export default function ServiceForm({ initialData, onSubmitSuccess }: ServiceFormProps) {
  const router = useRouter();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);

  const getInitialFormState = useCallback((): ServiceFormState => ({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    parent_service_slug: initialData?.parent_service_slug || null,
    status: initialData?.status || 'draft',
    excerpt: initialData?.excerpt || '',
    content_html: initialData?.content_html || '<p>Start writing your service details here!</p>',
    icon_svg: initialData?.icon_svg || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    featuresJson: initialData?.features ? JSON.stringify(initialData.features, null, 2) : '[]',
    call_to_action_label: initialData?.call_to_action_label || 'Get a Quote',
    call_to_action_link: initialData?.call_to_action_link || '/#contact-us',
    display_order: initialData?.display_order || 0,
    imageFiles: [],
    currentImageUrls: initialData?.image_urls || [],
  }), [initialData]);

  const [formData, setFormData] = useState<ServiceFormState>(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/service-categories/flat');
            if (!response.ok) throw new Error('Failed to fetch service categories');
            const data: ServiceCategory[] = await response.json();
            setServiceCategories(data);
        } catch (err) {
            console.error("Error fetching categories for form dropdown:", err);
        }
    };
    fetchCategories();
  }, []);
  
  const categoryTree = useMemo(() => {
    return serviceCategories
      .filter(c => c.parent_id === null)
      .sort((a,b) => a.display_order - b.display_order); // Sort top-level categories
  }, [serviceCategories]);

  useEffect(() => {
    setFormData(getInitialFormState());
    // Clean up old previews
    imagePreviews.forEach(preview => {
      if (preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setImagePreviews([]);
  }, [initialData, getInitialFormState]);

  // Cleanup function to properly handle image preview URLs
  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts or images change
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  // Fixed handleFileChange function with proper validation and preview generation
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = filesArray.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        
        if (!isValidType) {
          console.warn(`File ${file.name} is not a valid image type`);
          setError(`File ${file.name} is not a valid image type`);
          return false;
        }
        if (!isValidSize) {
          console.warn(`File ${file.name} is too large (max 5MB)`);
          setError(`File ${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        // Update form data with new files
        setFormData(prev => ({ 
          ...prev, 
          imageFiles: [...prev.imageFiles, ...validFiles] 
        }));
        
        // Create preview objects for valid files
        const newPreviews = validFiles.map(file => {
          const url = URL.createObjectURL(file);
          console.log('Created preview URL:', url, 'for file:', file.name);
          return { file, url };
        });
        
        setImagePreviews(prev => [...prev, ...newPreviews]);
        
        // Clear any previous errors if files are valid
        if (error && (error.includes('not a valid image type') || error.includes('too large'))) {
          setError(null);
        }
      }

      // Reset the input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  // Fixed removeNewImage function with proper cleanup
  const removeNewImage = (index: number) => {
    // Get the preview to revoke before removing it
    const previewToRemove = imagePreviews[index];
    if (previewToRemove && previewToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove.url);
      console.log('Revoked URL:', previewToRemove.url);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      imageFiles: prev.imageFiles.filter((_, i) => i !== index) 
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (urlToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      currentImageUrls: prev.currentImageUrls.filter(url => url !== urlToRemove) 
    }));
  };

  const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    const selectedService = serviceCategories.find(opt => opt.slug === selectedSlug);
    if (selectedService) {
        setFormData(prev => ({
            ...prev,
            title: selectedService.name,
            slug: selectedService.slug,
            parent_service_slug: selectedService.parent_id || null, // Automatically set parent slug
        }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: name === 'display_order' ? (parseInt(value, 10) || 0) : value}));
  };
  
  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, content_html: richText }));
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const dataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'imageFiles' && key !== 'currentImageUrls' && value !== null && value !== undefined) {
        dataToSubmit.append(key, String(value));
      }
    });

    formData.imageFiles.forEach(file => dataToSubmit.append('imageFiles', file));
    formData.currentImageUrls.forEach(url => dataToSubmit.append('currentImageUrls', url));

    try {
      const endpoint = initialData?.id ? `/api/admin/services/${initialData.id}` : '/api/admin/services';
      const method = initialData?.id ? 'PUT' : 'POST';
      const response = await fetch(endpoint, { method, body: dataToSubmit });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setSuccessMessage(result.message);
      if (onSubmitSuccess) onSubmitSuccess();

      if (!initialData) {
        // Clean up old previews before resetting
        imagePreviews.forEach(preview => {
          if (preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
        });
        setFormData(getInitialFormState());
        setImagePreviews([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <label htmlFor="service-title-select" className="block text-sm font-medium text-slate-700 mb-1">Service Title <span className="text-red-500">*</span></label>
                    <select id="service-title-select" name="title" value={formData.slug} onChange={handleServiceSelectChange} required className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                        <option value="" disabled>-- Select a service to pre-fill --</option>
                        {renderCategoryOptions(categoryTree, serviceCategories)}
                    </select>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <label htmlFor="content_html" className="block text-sm font-medium text-slate-700 mb-2">Service Content <span className="text-red-500">*</span></label>
                    <TipTapEditor content={formData.content_html} onChange={handleContentChange} />
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6 lg:sticky top-28">
                <SettingsCard title="Publishing">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                                {statusOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label>
                            <input 
                                type="number" 
                                name="display_order" 
                                id="display_order" 
                                value={formData.display_order || ''} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" 
                            />
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Details & Organization">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="slug" 
                                id="slug" 
                                value={formData.slug} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none sm:text-sm" 
                                readOnly 
                            />
                        </div>
                        <div>
                            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label>
                            <textarea 
                                id="excerpt" 
                                name="excerpt" 
                                rows={3} 
                                value={formData.excerpt || ''} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" 
                            />
                        </div>
                        <div>
                            <label htmlFor="featuresJson" className="block text-sm font-medium text-gray-700">Features (JSON Array)</label>
                            <textarea 
                                id="featuresJson" 
                                name="featuresJson" 
                                rows={5} 
                                value={formData.featuresJson} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono" 
                                placeholder='e.g., ["Detail 1", "Detail 2"]' 
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter a valid JSON array of strings.</p>
                        </div>
                    </div>
                </SettingsCard>
                
                <SettingsCard title="Service Images">
                    <div className="space-y-4">
                        <label htmlFor="imageFiles" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full min-h-[12rem] flex flex-col items-center justify-center text-center p-4">
                            <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <span className="mt-2 block text-sm font-semibold text-slate-600">Click to upload images</span>
                            <span className="block text-xs text-slate-500">PNG, JPG, GIF up to 5MB</span>
                            <input 
                                id="imageFiles" 
                                name="imageFiles" 
                                type="file" 
                                className="sr-only" 
                                onChange={handleFileChange} 
                                multiple 
                                accept="image/*" 
                            />
                        </label>
                        
                        {(formData.currentImageUrls.length > 0 || imagePreviews.length > 0) && (
                            <div className="space-y-4">
                                {/* Existing images */}
                                {formData.currentImageUrls.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.currentImageUrls.map((url, index) => (
                                                <div key={`existing-${index}`} className="relative group">
                                                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-slate-200">
                                                        <img 
                                                            src={url} 
                                                            alt={`Existing image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                console.error('Failed to load existing image:', url);
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMyA1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnYxNGEyIDIgMCAwIDEtMiAySDE1di0yaDRWNUg1djE0aDR2Mkg1YTIgMiAwIDAgMS0yLTJWNVoiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
                                                            }}
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeExistingImage(url)}
                                                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-lg transition-transform hover:scale-110 z-10"
                                                        title="Remove existing image"
                                                    >
                                                        <XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* New uploaded images preview */}
                                {imagePreviews.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={`preview-${index}-${preview.file.name}`} className="relative group">
                                                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-green-300">
                                                        <img 
                                                            src={preview.url} 
                                                            alt={`New upload: ${preview.file.name}`}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onLoad={() => console.log('Preview image loaded successfully:', preview.url)}
                                                            onError={(e) => {
                                                                console.error('Failed to load preview image:', preview.url);
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTIgMi01IDVINXY0aDJWOWgybDUtNSA1IDVoMnYyaDJWN2wtNS01WiIgZmlsbD0iI2ZmNTc1NyIvPjxwYXRoIGQ9Im0xMiAxOCA1LTVoMnYtNGgtMnY0aC0ybC01IDUtNS01SDN2NGgydjJoMmw1IDVaIiBmaWxsPSIjZmY1NzU3Ii8+PC9zdmc+';
                                                            }}
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-lg transition-transform hover:scale-110 z-10"
                                                        title={`Remove ${preview.file.name}`}
                                                    >
                                                        <XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
                                                    </button>
                                                    <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                                        New
                                                    </div>
                                                    <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded max-w-[80px] truncate" title={preview.file.name}>
                                                        {preview.file.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Show image count */}
                        {(formData.currentImageUrls.length > 0 || imagePreviews.length > 0) && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                📷 {formData.currentImageUrls.length} existing, {imagePreviews.length} new images
                            </p>
                        )}
                    </div>
                </SettingsCard>
            </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8">
             <div className="container mx-auto px-4">
                <div className="flex justify-end max-w-5xl mx-auto">
                    <div className="flex-1 mr-4">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{opacity: 0, y: 10}} 
                                    animate={{opacity: 1, y: 0}} 
                                    exit={{opacity: 0}} 
                                    className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" 
                                    role="alert"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {successMessage && (
                                <motion.div 
                                    initial={{opacity: 0, y: 10}} 
                                    animate={{opacity: 1, y: 0}} 
                                    exit={{opacity: 0}} 
                                    className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" 
                                    role="alert"
                                >
                                    {successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-50 transition-opacity"
                    >
                        {isSubmitting ? (
                            <>
                                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> 
                                Saving...
                            </>
                        ) : (
                            initialData?.id ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                </div>
             </div>
        </div>
    </form>
  );
}