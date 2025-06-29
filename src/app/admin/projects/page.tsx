// src/app/admin/projects/page.tsx
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { PlusIcon } from '@heroicons/react/24/outline';
// We will create ProjectsList a client component to fetch and display projects
import ProjectsList from './ProjectsList'; 

export default function AdminProjectsPage() {
  return (
    <>
      <PageHeader 
        title="Manage Projects"
        description="Add, edit, or delete showcase projects from your portfolio."
      >
        <Link href="/admin/projects/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm">
          <PlusIcon className="h-5 w-5 mr-2 inline-block" />
          Add New Project
        </Link>
      </PageHeader>
      <div className="mt-6">
        <ProjectsList />
      </div>
    </>
  );
}