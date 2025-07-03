'use client';

import { useState, useEffect, FormEvent, ChangeEvent, ReactNode, useCallback } from 'react'; // --- FIX: Added useCallback ---
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/admin/TipTapEditor';
import { ServicePageData } from '@/types'; 
import Image from 'next/image';
import { serviceOptions } from '@/lib/serviceOptions';
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

export default function ServiceForm({ initialData, onSubmitSuccess }: ServiceFormProps) {
  const router = useRouter();

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
    call_to_action_link: initialData?.call_to_action_link || '/contact',
    display_order: initialData?.display_order || 0,
    imageFiles: [],
    currentImageUrls: initialData?.image_urls || [],
  }), [initialData]);

  const [formData, setFormData] = useState<ServiceFormState>(getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setFormData(getInitialFormState());
    setImagePreviews([]);
  }, [initialData, getInitialFormState]);

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

  const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    const selectedService = serviceOptions.find(opt => opt.value === selectedSlug);
    if (selectedService) setFormData(prev => ({...prev, title: selectedService.label, slug: selectedService.value}));
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

    if (formData.currentImageUrls.length === 0 && formData.imageFiles.length === 0) {
      setError("Please add at least one image.");
      setIsSubmitting(false);
      return;
    }

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
        setFormData(getInitialFormState());
        setImagePreviews([]);
      } else if (result.service) {
        const updatedService = result.service as ServicePageData;
        setFormData(prev => ({
          ...getInitialFormState(),
          ...updatedService,
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <form onSubmit={handleSubmit}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
                <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <label htmlFor="service-title-select" className="block text-sm font-medium text-slate-700 mb-1">Service Title <span className="text-red-500">*</span></label>
                    <select id="service-title-select" name="title" value={formData.slug} onChange={handleServiceSelectChange} required className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                        <option value="" disabled>-- Select a service to pre-fill --</option>
                        {serviceOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                    </select>
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <label htmlFor="content_html" className="block text-sm font-medium text-slate-700 mb-2">Service Content <span className="text-red-500">*</span></label>
                    <TipTapEditor content={formData.content_html} onChange={handleContentChange} />
                </motion.div>
            </div>

            {/* Sidebar Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6 lg:sticky top-28">
                <SettingsCard title="Publishing">
                    <div className="space-y-4">
                        <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">{statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}</select></div>
                        <div><label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label><input type="number" name="display_order" id="display_order" value={formData.display_order || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Details & Organization">
                    <div className="space-y-4">
                         <div><label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label><input type="text" name="slug" id="slug" value={formData.slug} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none sm:text-sm" readOnly /></div>
                         <div><label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label><textarea id="excerpt" name="excerpt" rows={3} value={formData.excerpt || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
                         <div><label htmlFor="featuresJson" className="block text-sm font-medium text-gray-700">Features (JSON Array)</label><textarea id="featuresJson" name="featuresJson" rows={5} value={formData.featuresJson} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono" placeholder='e.g., ["Detail 1", "Detail 2"]' /><p className="mt-1 text-xs text-gray-500">Enter a valid JSON array of strings.</p></div>
                    </div>
                </SettingsCard>
                
                <SettingsCard title="Service Images">
                     <label htmlFor="imageFiles" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full min-h-[12rem] flex flex-col items-center justify-center text-center p-4">
                        <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <span className="mt-2 block text-sm font-semibold text-slate-600">Click to upload images</span>
                        <span className="block text-xs text-slate-500">PNG, JPG, GIF up to 5MB</span>
                        <input id="imageFiles" name="imageFiles" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/*" />
                    </label>
                    {(formData.currentImageUrls.length > 0 || imagePreviews.length > 0) && (
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {formData.currentImageUrls.map((url) => (
                                <div key={url} className="relative group aspect-square"><Image src={url} alt="Existing image" fill className="object-cover rounded-md border" sizes="15vw"/><button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-white rounded-full transition-transform hover:scale-110"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button></div>
                            ))}
                            {imagePreviews.map((previewUrl, index) => (
                                <div key={previewUrl} className="relative group aspect-square"><Image src={previewUrl} alt="New preview" fill className="object-cover rounded-md border" sizes="15vw"/><button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full transition-transform hover:scale-110"><XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-700" /></button></div>
                            ))}
                        </div>
                    )}
                </SettingsCard>

                <SettingsCard title="SEO & Call To Action">
                    <div className="space-y-4">
                        <div><label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">Meta Title</label><input type="text" name="meta_title" id="meta_title" value={formData.meta_title || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
                        <div><label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">Meta Description</label><textarea id="meta_description" name="meta_description" rows={3} value={formData.meta_description || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" /></div>
                        <div><label htmlFor="call_to_action_label" className="block text-sm font-medium text-gray-700">CTA Button Label</label><input type="text" name="call_to_action_label" id="call_to_action_label" value={formData.call_to_action_label || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., Get Started" /></div>
                        <div><label htmlFor="call_to_action_link" className="block text-sm font-medium text-gray-700">CTA Button Link</label><input type="text" name="call_to_action_link" id="call_to_action_link" value={formData.call_to_action_link || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., /contact-us" /></div>
                    </div>
                </SettingsCard>
            </motion.div>

        {/* --- THE FIX: Added the missing closing tag --- */}
        </motion.div>

        {/* Sticky Footer Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8 -mx-8 px-8">
             <div className="container mx-auto px-4">
                <div className="flex justify-end max-w-5xl mx-auto">
                    <div className="flex-1 mr-4">
                        <AnimatePresence>
                            {error && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</motion.div>}
                            {successMessage && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</motion.div>}
                        </AnimatePresence>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-50 transition-opacity">
                        {isSubmitting ? <><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Saving...</> : (initialData?.id ? 'Update Service' : 'Create Service')}
                    </button>
                </div>
             </div>
        </div>
    </form>
  );
}
