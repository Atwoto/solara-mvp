// src/app/admin/projects/new/page.tsx
import ProjectForm from "@/components/admin/ProjectForm";
import PageHeader from "@/components/admin/PageHeader";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader 
        title="Add New Project" 
        description="Fill in the details for your new portfolio project."
        showBackButton={true}
        backButtonHref="/admin/projects"
      />
      <div className="mt-6">
        <ProjectForm />
      </div>
    </>
  );
}