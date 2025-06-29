// src/app/admin/projects/ProjectsList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
// We will create ProjectsTable component next
// import ProjectsTable from '@/components/admin/ProjectsTable';

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch logic to get all projects (published and drafts)
    // from an admin-specific API endpoint, e.g., `/api/admin/projects`
  }, []);

  if (isLoading) return <p>Loading projects...</p>;

  // return <ProjectsTable projects={projects} />;
  return <p>Project table will go here.</p>; // Placeholder
}