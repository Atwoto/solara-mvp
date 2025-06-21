// src/components/admin/ServiceForm.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/admin/TipTapEditor';
import { ServicePageData } from '@/types'; 
import Image from 'next/image';

interface ServiceFormProps {
  initialData?: ServicePageData | null;
  onSubmitSuccess?: () => void;
}

const statusOptions: ServicePageData['status'][] = ['draft', 'published', 'archived'];

type ServiceFormState = Omit<ServicePageData, 'id' | 'created_at' | 'updated_at' | 'hero_image_url' | 'features'> & {
    featuresJson: string;
    imageFile: File | null;
    currentImageUrl?: string | null;
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
    imageFile: null,
    currentImageUrl: initialData?.hero_image_url || null,
  });

  const [formData, setFormData] = useState<ServiceFormState>(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.hero_image_url || null);

  useEffect(() => {
    if (initialData) {
      setFormData(getInitialFormState());
      setImagePreview(initialData.hero_image_url || null);
    }
  }, [initialData]);

  const titleToSlug = (titleString: string) => {
    return titleString.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
        ...prev,
        title: newTitle,
        slug: (!prev.slug || prev.slug === titleToSlug(prev.title)) ? titleToSlug(newTitle) : prev.slug
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     if (name === 'slug') {
        setFormData(prev => ({ ...prev, slug: titleToSlug(value) }));
    } else {
        // Handle number inputs specifically
        if (name === 'display_order') {
            const numValue = parseInt(value, 10);
            setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }
  };

  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, content_html: richText }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) { setError('Invalid file type (JPG, PNG, WEBP, GIF).'); e.target.value = ''; return; }
      if (file.size > 2 * 1024 * 1024) { setError('File too large (max 2MB).'); e.target.value = ''; return; }
      setError(null);
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageFile: null }));
      setImagePreview(formData.currentImageUrl || null);
    }
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.title.trim() || !formData.slug.trim() || !formData.content_html.trim() || formData.content_html === '<p></p>') {
        setError("Title, Slug, and Content are required."); 
        setIsSubmitting(false);
        return;
    }
    try {
        const features = JSON.parse(formData.featuresJson);
        if (!Array.isArray(features)) throw new Error();
    } catch (e) {
        setError("Features must be a valid JSON array."); 
        setIsSubmitting(false);
        return;
    }

    const dataToSubmit = new FormData(); 
    dataToSubmit.append('title', formData.title.trim());
    dataToSubmit.append('slug', formData.slug.trim());
    dataToSubmit.append('content_html', formData.content_html);
    dataToSubmit.append('status', formData.status);
    if (formData.parent_service_slug) dataToSubmit.append('parent_service_slug', formData.parent_service_slug);
    if (formData.excerpt) dataToSubmit.append('excerpt', formData.excerpt.trim());
    if (formData.icon_svg) dataToSubmit.append('icon_svg', formData.icon_svg);
    if (formData.meta_title) dataToSubmit.append('meta_title', formData.meta_title.trim());
    if (formData.meta_description) dataToSubmit.append('meta_description', formData.meta_description.trim());
    dataToSubmit.append('featuresJson', formData.featuresJson);
    if (formData.call_to_action_label) dataToSubmit.append('call_to_action_label', formData.call_to_action_label.trim());
    if (formData.call_to_action_link) dataToSubmit.append('call_to_action_link', formData.call_to_action_link.trim());
    
    // *** THE FIX IS HERE ***
    // Only append display_order if it's a valid number.
    if (typeof formData.display_order === 'number' && !isNaN(formData.display_order)) {
        dataToSubmit.append('display_order', formData.display_order.toString());
    }
    
    if (formData.imageFile) {
      dataToSubmit.append('imageFile', formData.imageFile);
    }
    if (initialData && formData.currentImageUrl && !formData.imageFile) {
        dataToSubmit.append('currentImageUrl', formData.currentImageUrl);
    }

    try {
      const endpoint = initialData?.id 
        ? `/api/admin/services/${initialData.id}` 
        : '/api/admin/services';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        body: dataToSubmit, 
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to ${initialData?.id ? 'update' : 'create'} service`);
      }
      setSuccessMessage(result.message || `Service ${initialData?.id ? 'updated' : 'created'} successfully!`);
      if (onSubmitSuccess) {
          onSubmitSuccess();
      }
      if (!initialData) {
          setFormData(getInitialFormState()); 
          setImagePreview(null);
          const fileInput = document.getElementById('heroImageFile') as HTMLInputElement;
          if (fileInput) fileInput.value = "";
      } else {
          if (result.service) {
              const updatedService = result.service as ServicePageData;
              setFormData(prev => ({
                  ...prev,
                  ...updatedService, // This will update all fields from the returned service
                  featuresJson: updatedService.features ? JSON.stringify(updatedService.features, null, 2) : '[]',
                  currentImageUrl: updatedService.hero_image_url || null,
                  imageFile: null, 
              }));
              setImagePreview(updatedService.hero_image_url || null);
          }
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
        <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Service Title <span className="text-red-500">*</span></label><input type="text" name="title" id="title" value={formData.title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
        <div><label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label><input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., residential-solar" /></div>
      </div>

      <div><label htmlFor="content_html" className="block text-sm font-medium text-gray-700 mb-1">Service Content <span className="text-red-500">*</span></label><TipTapEditor content={formData.content_html} onChange={handleContentChange} /></div>
      
      <div>
        <label htmlFor="heroImageFile" className="block text-sm font-medium text-gray-700 mb-1">
          Hero Image {initialData?.id ? "(Replace Current)" : ""}
        </label>
        {imagePreview && (
          <div className="mt-2 mb-2">
            <Image src={imagePreview} alt="Hero image preview" width={200} height={120} className="h-32 w-auto object-contain border rounded-md p-1 bg-gray-50"/>
          </div>
        )}
        <input 
          type="file" 
          name="heroImageFile" 
          id="heroImageFile" 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">Max 2MB. Recommended: Landscape aspect ratio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">{statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}</select></div>
        <div><label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label><input type="number" name="display_order" id="display_order" value={formData.display_order || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
      </div>
      <div><label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label><textarea id="excerpt" name="excerpt" rows={3} value={formData.excerpt || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
      <div><label htmlFor="parent_service_slug" className="block text-sm font-medium text-gray-700">Parent Service Slug (Optional)</label><input type="text" name="parent_service_slug" id="parent_service_slug" value={formData.parent_service_slug || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., residential-services" /></div>
      <div><label htmlFor="featuresJson" className="block text-sm font-medium text-gray-700">Features (JSON Array)</label><textarea id="featuresJson" name="featuresJson" rows={5} value={formData.featuresJson} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono" placeholder='e.g., ["Detail 1", "Detail 2"]' /><p className="mt-1 text-xs text-gray-500">Enter a valid JSON array. For simple lists: `["Item 1", "Item 2"]`.</p></div>
      <fieldset className="mt-6 border-t border-gray-200 pt-6"><legend className="text-base font-medium text-gray-900">SEO & Meta Data</legend><div className="mt-4 space-y-4"><div><label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">Meta Title</label><input type="text" name="meta_title" id="meta_title" value={formData.meta_title || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div><div><label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">Meta Description</label><textarea id="meta_description" name="meta_description" rows={3} value={formData.meta_description || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div></div></fieldset>
      <fieldset className="mt-6 border-t border-gray-200 pt-6"><legend className="text-base font-medium text-gray-900">Call To Action</legend><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"><div><label htmlFor="call_to_action_label" className="block text-sm font-medium text-gray-700">CTA Button Label</label><input type="text" name="call_to_action_label" id="call_to_action_label" value={formData.call_to_action_label || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., Get Started" /></div><div><label htmlFor="call_to_action_link" className="block text-sm font-medium text-gray-700">CTA Button Link</label><input type="text" name="call_to_action_link" id="call_to_action_link" value={formData.call_to_action_link || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., /contact-us" /></div></div></fieldset>
      <div className="pt-6"><button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-flare-start disabled:opacity-70 transition-colors">{isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Service' : 'Create Service')}</button></div>
    </form>
  );
}