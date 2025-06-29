'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/admin/TipTapEditor';
import { ServicePageData } from '@/types'; 
import Image from 'next/image';
import { serviceOptions } from '@/lib/serviceOptions';
import { XCircleIcon } from '@heroicons/react/24/solid'; // For remove buttons

interface ServiceFormProps {
  initialData?: ServicePageData | null;
  onSubmitSuccess?: () => void;
}

const statusOptions: ServicePageData['status'][] = ['draft', 'published', 'archived'];

// --- STATE UPGRADE: Now handles arrays of images ---
type ServiceFormState = Omit<ServicePageData, 'id' | 'created_at' | 'updated_at' | 'image_urls' | 'features'> & {
    featuresJson: string;
    imageFiles: File[]; // Changed from single File to File[]
    currentImageUrls: string[]; // Changed from single string to string[]
};

export default function ServiceForm({ initialData, onSubmitSuccess }: ServiceFormProps) {
  const router = useRouter();

  const getInitialFormState = (): ServiceFormState => ({
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
    call_to_action_link: initialData?.call_to_action_link || '/contact',
    display_order: initialData?.display_order || 0,
    imageFiles: [], // Now an array
    currentImageUrls: initialData?.image_urls || [], // Use the new image_urls array
  });

  const [formData, setFormData] = useState<ServiceFormState>(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Previews are also an array

  useEffect(() => {
    setFormData(getInitialFormState());
    setImagePreviews([]);
  }, [initialData]);

  const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    const selectedService = serviceOptions.find(opt => opt.value === selectedSlug);
    if (selectedService) {
        setFormData(prev => ({ ...prev, title: selectedService.label, slug: selectedService.value }));
    } else {
        setFormData(prev => ({ ...prev, title: '', slug: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'display_order' ? (parseInt(value, 10) || 0) : value }));
  };

  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, content_html: richText }));
  };
  
  // --- UPGRADED FILE HANDLER FOR MULTIPLE FILES ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...filesArray] }));
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (urlToRemove: string) => {
    setFormData(prev => ({ ...prev, currentImageUrls: prev.currentImageUrls.filter(url => url !== urlToRemove) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    // ... validation logic
    if (formData.currentImageUrls.length === 0 && formData.imageFiles.length === 0) {
      setError("Please add at least one image.");
      setIsSubmitting(false);
      return;
    }

    const dataToSubmit = new FormData();
    // Append all regular fields
    Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'imageFiles' && key !== 'currentImageUrls' && value !== null) {
            dataToSubmit.append(key, String(value));
        }
    });

    // Append all NEW image files
    formData.imageFiles.forEach(file => {
      dataToSubmit.append('imageFiles', file);
    });

    // Append the list of REMAINING existing URLs
    formData.currentImageUrls.forEach(url => {
        dataToSubmit.append('currentImageUrls', url);
    });
    
    // ... submission logic remains largely the same
    try {
      const endpoint = initialData?.id ? `/api/admin/services/${initialData.id}` : '/api/admin/services';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, { method, body: dataToSubmit });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setSuccessMessage(result.message);
      if (onSubmitSuccess) onSubmitSuccess();

      // Reset form state correctly
      if (!initialData) {
          setFormData(getInitialFormState());
          setImagePreviews([]);
      } else if (result.service) {
          const updatedService = result.service as ServicePageData;
          setFormData(prev => ({
              ...getInitialFormState(), // Start fresh
              ...updatedService,       // Apply updates
              featuresJson: updatedService.features ? JSON.stringify(updatedService.features, null, 2) : '[]',
              imageFiles: [],
              currentImageUrls: updatedService.image_urls || [],
          }));
          setImagePreviews([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md">
      {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
      {successMessage && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="service-title-select" className="block text-sm font-medium text-gray-700">Service Title <span className="text-red-500">*</span></label>
            <select id="service-title-select" name="title" value={formData.slug} onChange={handleServiceSelectChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                <option value="" disabled>-- Select a service --</option>
                {serviceOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
        </div>
        <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
            <input type="text" name="slug" id="slug" value={formData.slug} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none sm:text-sm" readOnly />
        </div>
      </div>

      <div><label htmlFor="content_html" className="block text-sm font-medium text-gray-700 mb-1">Service Content <span className="text-red-500">*</span></label><TipTapEditor content={formData.content_html} onChange={handleContentChange} /></div>
      
      {/* --- UPGRADED IMAGE UPLOAD UI --- */}
      <div>
        <label htmlFor="imageFiles" className="block text-sm font-medium text-gray-700 mb-2">Service Images</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
          {formData.currentImageUrls.map((url) => (
            <div key={url} className="relative group aspect-square">
              <Image src={url} alt="Existing image" fill className="object-cover rounded-md border" />
              <button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-white rounded-full"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button>
            </div>
          ))}
          {imagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative group aspect-square">
              <Image src={previewUrl} alt="New preview" fill className="object-cover rounded-md border" />
              <button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button>
            </div>
          ))}
        </div>
        <input 
          type="file" 
          name="imageFiles" 
          id="imageFiles" 
          onChange={handleFileChange} 
          multiple
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">You can add multiple images. Max 2MB per file.</p>
      </div>

      {/* ... Other fields like status, display order, etc. ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">{statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}</select></div>
        <div><label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label><input type="number" name="display_order" id="display_order" value={formData.display_order || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
      </div>
      
      <div className="pt-6">
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-flare-start disabled:opacity-70 transition-colors">
              {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Service' : 'Create Service')}
          </button>
      </div>
    </form>
  );
}