// src/app/admin/county-resources/ResourceClientPage.tsx
'use client';

import { useState, useMemo, FormEvent } from 'react';
import { CountyResource } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import { PlusIcon, MapIcon, DocumentTextIcon, TrashIcon, PencilIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const kenyanCounties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

// --- Main Client Component (No changes needed here) ---
export default function ResourceClientPage({ initialResources }: { initialResources: CountyResource[] }) {
  const [resources, setResources] = useState<CountyResource[]>(initialResources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CountyResource | null>(null);
  const router = useRouter();

  const groupedResources = useMemo(() => {
    return resources.reduce((acc, resource) => {
      (acc[resource.county_name] = acc[resource.county_name] || []).push(resource);
      return acc;
    }, {} as Record<string, CountyResource[]>);
  }, [resources]);

  const handleOpenModal = (resource: CountyResource | null = null) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleDelete = async (resourceId: string, fileUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }
    try {
      const { error: dbError } = await supabase.from('county_resources').delete().eq('id', resourceId);
      if (dbError) throw dbError;

      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('county-resources').remove([fileName]);
      }
      
      setResources(prev => prev.filter(r => r.id !== resourceId));
      alert("Resource deleted successfully.");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="County Resources"
        description="Manage downloadable documents for each county profile."
      >
        <button
          onClick={() => handleOpenModal()}
          className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Add New Resource
        </button>
      </PageHeader>

      <div className="mt-8 space-y-10">
        {Object.keys(groupedResources).length > 0 ? (
          Object.entries(groupedResources).map(([county, countyResources]) => (
            <div key={county}>
              <h2 className="text-xl font-bold text-deep-night flex items-center gap-2">
                <MapIcon className="h-6 w-6 text-solar-flare-end" />
                {county}
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countyResources.map(resource => (
                  <div key={resource.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-deep-night hover:text-solar-flare-start transition-colors">
                          {resource.file_title}
                        </a>
                        <p className="text-sm text-gray-500 mt-1">{resource.file_description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <button onClick={() => handleDelete(resource.id, resource.file_url)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No county resources have been added yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ResourceFormModal
            resource={selectedResource}
            onClose={handleCloseModal}
            onSuccess={() => {
              handleCloseModal();
              router.refresh(); 
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Form Modal Component (Updated Logic) ---
function ResourceFormModal({ resource, onClose, onSuccess }: { resource: CountyResource | null; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({
    county_name: resource?.county_name || '',
    file_title: resource?.file_title || '',
    file_description: resource?.file_description || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.county_name || !formData.file_title) {
      setError("County and File Title are required.");
      return;
    }
    if (!resource && !file) {
      setError("A file is required to create a new resource.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      let file_url = resource?.file_url || '';
      let file_type = resource?.file_type || '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.county_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('county-resources')
          .upload(fileName, file);

        if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage.from('county-resources').getPublicUrl(uploadData.path);
        file_url = urlData.publicUrl;
        file_type = fileExt?.toUpperCase() || '';
      }

      // --- THIS IS THE FIX ---
      // Instead of writing to DB directly, we call our new secure API endpoint.
      const response = await fetch('/api/admin/county-resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              ...(resource && { id: resource.id }), // include id if updating
              ...formData,
              file_url,
              file_type,
          }),
      });

      if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || 'Failed to save resource.');
      }

      alert(`Resource ${resource ? 'updated' : 'created'} successfully!`);
      onSuccess();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-deep-night">{resource ? 'Edit' : 'Add New'} Resource</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
          
          <div>
            <label htmlFor="county_name" className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <select
              id="county_name"
              value={formData.county_name}
              onChange={(e) => setFormData(f => ({ ...f, county_name: e.target.value }))}
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-flare-start focus:border-solar-flare-start"
            >
              <option value="" disabled>Select a county</option>
              {kenyanCounties.map(county => <option key={county} value={county}>{county}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="file_title" className="block text-sm font-medium text-gray-700 mb-1">File Title</label>
            <input
              type="text"
              id="file_title"
              value={formData.file_title}
              onChange={(e) => setFormData(f => ({ ...f, file_title: e.target.value }))}
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-flare-start focus:border-solar-flare-start"
            />
          </div>

          <div>
            <label htmlFor="file_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="file_description"
              rows={3}
              value={formData.file_description}
              onChange={(e) => setFormData(f => ({ ...f, file_description: e.target.value }))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-flare-start focus:border-solar-flare-start"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload File {resource ? '(Optional: leave blank to keep existing)' : ''}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400"/>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-solar-flare-end hover:text-solar-flare-start focus-within:outline-none">
                            <span>{file ? 'Change file' : 'Select a file'}</span>
                            <input id="file" name="file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">{file ? file.name : 'PDF, DOCX, PNG, JPG up to 10MB'}</p>
                </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-deep-night text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
