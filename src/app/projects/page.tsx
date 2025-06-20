// src/app/projects/page.tsx
import PageHeader from "@/components/PageHeader";

const ProjectsPage = () => {
  return (
    <>
      <PageHeader
        title="Our Projects"
        subtitle="See our commitment to quality in action."
      />
      <main className="container mx-auto px-4 py-16">
        <p className="text-center text-lg text-gray-700 mb-12">
          Here you'll find a gallery of our recent residential and commercial installations. Check back soon for updates!
        </p>
        {/* Placeholder for a gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Project Image Coming Soon</p>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Project Image Coming Soon</p>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Project Image Coming Soon</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProjectsPage;