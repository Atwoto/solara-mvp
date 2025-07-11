// src/app/county-resources/page.tsx
import { supabaseAdmin } from '@/lib/supabase/server'; // Use the admin client for simplicity and reliability
import { CountyResource } from '@/types';
import PageHeader from '@/components/PageHeader';
import { MapIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// This forces the page to be dynamically rendered to always show the latest files.
export const dynamic = 'force-dynamic';

// Helper function to group resources by county
const groupResourcesByCounty = (resources: CountyResource[]) => {
  return resources.reduce((acc, resource) => {
    (acc[resource.county_name] = acc[resource.county_name] || []).push(resource);
    return acc;
  }, {} as Record<string, CountyResource[]>);
};

export default async function CountyResourcesPage() {
  // --- THIS IS THE FIX ---
  // Using the 'supabaseAdmin' client to fetch the data on the server.
  // This bypasses any complex RLS issues for public-facing read operations.
  const { data, error } = await supabaseAdmin
    .from('county_resources')
    .select('*')
    .eq('is_published', true)
    .order('county_name', { ascending: true })
    .order('file_title', { ascending: true });

  if (error) {
    console.error('Error fetching county resources:', error.message);
  }

  const resources: CountyResource[] = data || [];
  const groupedResources = groupResourcesByCounty(resources);

  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Download valuable guides, datasheets, and permit information for your county."
        backgroundImageUrl="/images/projects-hero-bg.jpg"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Resources', href: '/county-resources' }]}
      />

      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          {resources.length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedResources).map(([county, countyResources]) => (
                <div key={county}>
                  <div className="flex items-center mb-6">
                    <MapIcon className="h-8 w-8 text-solar-flare-end" />
                    <h2 className="ml-3 text-2xl sm:text-3xl font-bold text-deep-night">
                      {county} County
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countyResources.map(resource => (
                      <div key={resource.id} className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-6 flex flex-col">
                        <h3 className="text-lg font-semibold text-deep-night">{resource.file_title}</h3>
                        <p className="text-sm text-gray-500 mt-2 flex-grow">
                          {resource.file_description || 'No description available.'}
                        </p>
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-deep-night hover:bg-gray-800 rounded-lg shadow-md transition-colors duration-200"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                          Download ({resource.file_type || 'File'})
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <MapIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h2 className="mt-4 text-2xl font-bold text-deep-night">No Resources Available</h2>
              <p className="mt-2">Please check back later for downloadable guides and documents.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
