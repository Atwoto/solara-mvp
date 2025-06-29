// src/app/admin/projects/ProjectsList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    // ... (fetch logic remains the same)
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const handleDelete = async (projectId: string) => {
    // ... (delete logic will be implemented with the edit page)
  }

  if (isLoading) return <p className="text-center py-8">Loading projects...</p>;
  if (error) return <p className="text-center py-8 text-red-500">Error: {error}</p>;
  if (projects.length === 0) return <p className="text-center py-8 text-gray-500">No projects found.</p>;

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => {
            // --- THIS IS THE FIX: Simplified image source logic ---
            const imageSrc = project.thumbnail_url || (project.type === 'image' ? project.media_url : null);

            return (
              <tr key={project.id}>
                <td className="px-6 py-4">
                  <div className="relative h-12 w-20 rounded-md overflow-hidden bg-gray-200">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">No Thumb</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {project.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link href={`/admin/projects/edit/${project.id}`} className="text-indigo-600 hover:text-indigo-800 p-1"><PencilSquareIcon className="h-5 w-5 inline"/></Link>
                  <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800 p-1"><TrashIcon className="h-5 w-5 inline"/></button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}