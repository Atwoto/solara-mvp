// src/app/admin/projects/edit/[projectId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import ProjectForm from '@/components/admin/ProjectForm';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';

export default function EditProjectPage({ params }: { params: { projectId: string }}) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${params.projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project data.');
        const data = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [params.projectId]);

  if (isLoading) return <PageLoader message="Loading project details..." />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!project) return <div className="p-6 text-gray-500">Project not found.</div>;

  return (
    <>
      <PageHeader
        title="Edit Project"
        description={`Now editing: ${project.title}`}
        showBackButton={true}
        backButtonHref="/admin/projects"
      />
      <div className="mt-6">
        <ProjectForm initialData={project} />
      </div>
    </>
  );
}