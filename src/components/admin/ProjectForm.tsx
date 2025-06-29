// src/components/admin/ProjectForm.tsx
'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectCategory, projectCategories } from '@/types';
import Image from 'next/image';

interface ProjectFormProps {
  initialData?: Project | null;
}

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
  });
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [mediaPreview, setMediaPreview] = useState<string | null>(initialData?.media_url && initialData.type === 'image' ? initialData.media_url : null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const dataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      dataToSubmit.append(key, String(value));
    });

    if (mediaFile) dataToSubmit.append('mediaFile', mediaFile);
    if (thumbnailFile) dataToSubmit.append('thumbnailFile', thumbnailFile);

    const endpoint = initialData ? `/api/admin/projects/${initialData.id}` : '/api/admin/projects';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, { method, body: dataToSubmit });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      router.push('/admin/projects');
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md">
      {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
        <input type="text" id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as ProjectCategory})} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
            {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Project Type</label>
          <select id="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as 'image' | 'video', media_url: ''})} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>
      
      {formData.type === 'video' ? (
        <div>
          <label htmlFor="media_url" className="block text-sm font-medium text-gray-700">YouTube Embed URL</label>
          <input type="url" id="media_url" value={formData.media_url} onChange={(e) => setFormData({...formData, media_url: e.target.value})} placeholder="e.g., https://www.youtube.com/embed/your_video_id" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
          <p className="mt-1 text-xs text-gray-500">Go to YouTube  Share Embed, and copy only the URL from the `src="..."` attribute.</p>
        </div>
      ) : (
        <div>
          <label htmlFor="mediaFile" className="block text-sm font-medium text-gray-700">Project Image</label>
          {mediaPreview && <Image src={mediaPreview} alt="Media preview" width={200} height={150} className="mt-2 rounded-md border object-cover" />}
          <input type="file" id="mediaFile" onChange={(e) => handleFileChange(e, 'media')} accept="image/*" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start/10 file:text-solar-flare-end hover:file:bg-solar-flare-start/20"/>
        </div>
      )}

      <div>
        <label htmlFor="thumbnailFile" className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
        <p className="text-xs text-gray-500">Required for videos. Optional for images.</p>
        {thumbnailPreview && <Image src={thumbnailPreview} alt="Thumbnail preview" width={200} height={150} className="mt-2 rounded-md border object-cover" />}
        <input type="file" id="thumbnailFile" onChange={(e) => handleFileChange(e, 'thumbnail')} accept="image/*" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start/10 file:text-solar-flare-end hover:file:bg-solar-flare-start/20"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <div className="pt-6 border-t">
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-70 transition-colors">
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
}