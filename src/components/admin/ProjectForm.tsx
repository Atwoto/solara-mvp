// src/components/admin/ProjectForm.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectCategory, projectCategories } from '@/types';
import Image from 'next/image';
import { PhotoIcon, XCircleIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ProjectFormProps {
  initialData?: Project | null;
}

// A reusable component for the collapsible sidebar sections
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

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Residential',
    type: initialData?.type || 'image',
    media_url: initialData?.media_url || '',
    is_published: initialData?.is_published ?? true,
    display_order: initialData?.display_order || 0,
    // --- NEW: Add highlightsJson to the form state ---
    highlightsJson: initialData?.highlights ? JSON.stringify(initialData.highlights, null, 2) : '[]',
  });
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [mediaPreview, setMediaPreview] = useState<string | null>(initialData?.media_url && initialData.type === 'image' ? initialData.media_url : null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
     setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'media' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'media') {
        setMediaFile(file);
        if(file.type.startsWith('image/')) setMediaPreview(URL.createObjectURL(file));
        else setMediaPreview(null);
      } else {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Use a temporary variable for iframe logic to avoid mutating state directly
    let finalMediaUrl = formData.media_url;
    if (formData.type === 'video' && formData.media_url) {
        const srcMatch = formData.media_url.match(/src="([^"]+)"/);
        if (!srcMatch || !srcMatch[1]) {
            setError('Invalid iframe code. Please paste the full embed code from YouTube.');
            setIsSubmitting(false);
            return;
        }
        finalMediaUrl = srcMatch[1];
    }
    
    const dataToSubmit = new FormData();
    // Append all form data, including the new highlightsJson
    Object.entries(formData).forEach(([key, value]) => {
        // Handle the media_url separately
        if (key !== 'media_url') {
            dataToSubmit.append(key, String(value));
        }
    });
    dataToSubmit.append('media_url', finalMediaUrl);

    if (mediaFile) dataToSubmit.append('mediaFile', mediaFile);
    if (thumbnailFile) dataToSubmit.append('thumbnailFile', thumbnailFile);

    const endpoint = initialData ? `/api/admin/projects/${initialData.id}` : '/api/admin/projects';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, { method, body: dataToSubmit });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message);
      
      router.push('/admin/projects');
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
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
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input type="text" id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="block w-full text-2xl font-bold p-2 border-x-0 border-t-0 border-b-2 border-slate-200 focus:ring-0 focus:border-solar-flare-start transition-colors" placeholder="e.g., Residential Solar Installation" />
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={5} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="A brief summary of the project..."></textarea>
                </motion.div>

                {/* --- NEW: Highlights Section --- */}
                <motion.div variants={itemVariants}>
                     <SettingsCard title="Project Highlights">
                        <div>
                            <label htmlFor="highlightsJson" className="block text-sm font-medium text-gray-700">Highlights (JSON Array)</label>
                            <textarea 
                                id="highlightsJson"
                                rows={5} 
                                value={formData.highlightsJson} 
                                onChange={handleInputChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono" 
                                placeholder='e.g., ["10kW System Installed", "Payback period of 4 years"]' 
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter a valid JSON array of strings or objects.</p>
                        </div>
                    </SettingsCard>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Media</h3>
                    {/* ... (rest of the media section is unchanged) ... */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project Type</label>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                {(['image', 'video'] as const).map(type => (
                                    <button key={type} type="button" onClick={() => setFormData({...formData, type, media_url: ''})} className={`relative flex items-center justify-center p-3 text-sm font-medium rounded-lg border-2 transition-all ${formData.type === type ? 'border-solar-flare-start bg-solar-flare-start/5 text-solar-flare-end' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                                        {formData.type === type && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-solar-flare-start"></div>}
                                        <span className="capitalize">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {formData.type === 'video' ? (
                            <div>
                                <label htmlFor="media_url" className="block text-sm font-medium text-gray-700">YouTube Embed Code</label>
                                <textarea id="media_url" value={formData.media_url} onChange={(e) => setFormData({...formData, media_url: e.target.value})} placeholder='Paste the full <iframe ...> code from YouTube Share -> Embed' required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono" />
                                <p className="mt-1 text-xs text-gray-500">We will automatically extract the correct URL for you.</p>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="mediaFile" className="block text-sm font-medium text-gray-700">Project Image</label>
                                <label htmlFor="mediaFile" className="mt-2 relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full h-48 flex flex-col items-center justify-center text-center p-4">
                                    {mediaPreview ? (
                                        <Image src={mediaPreview} alt="Media preview" layout="fill" className="object-contain p-2" />
                                    ) : (
                                        <div className="text-slate-500"><PhotoIcon className="mx-auto h-12 w-12" /><span className="mt-2 block text-sm font-semibold">Click to upload an image</span></div>
                                    )}
                                    <input type="file" id="mediaFile" onChange={(e) => handleFileChange(e, 'media')} accept="image/*" className="sr-only"/>
                                </label>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Sidebar Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6 lg:sticky top-28">
                <SettingsCard title="Publishing">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="is_published" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="is_published" value={String(formData.is_published)} onChange={(e) => setFormData({...formData, is_published: e.target.value === 'true'})} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                                <option value="true">Published</option>
                                <option value="false">Draft</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label>
                            <input type="number" id="display_order" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value, 10) || 0})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm"/>
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Organization">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as ProjectCategory})} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                            {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </SettingsCard>
                
                <SettingsCard title="Thumbnail Image" defaultOpen={false}>
                     {/* ... (thumbnail section is unchanged) ... */}
                </SettingsCard>
            </motion.div>
        </motion.div>

        {/* Sticky Footer Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8 -mx-8 px-8">
            {/* ... (footer is unchanged) ... */}
        </div>
    </form>
  );
}