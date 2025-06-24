// src/app/services/[serviceSlug]/page.tsx
import { notFound } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import PageHeader from '@/components/PageHeader';
import { ServicePageData } from '@/types';
import { CheckBadgeIcon, WrenchScrewdriverIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// --- Type for our breadcrumb generation ---
interface Breadcrumb { name: string; href: string; }

// --- Data Fetching Functions ---
// Fetches the specific service page by its slug
async function getServiceData(slug: string): Promise<ServicePageData | null> {
  const { data, error } = await supabase.from('service_pages').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) { console.error(`Error fetching service '${slug}':`, error); return null; }
  return data;
}

// Fetches ALL services to build the navigation path
async function getAllServices(): Promise<Pick<ServicePageData, 'slug' | 'title' | 'parent_service_slug'>[]> {
  const { data, error } = await supabase.from('service_pages').select('slug, title, parent_service_slug').eq('status', 'published');
  if (error) { console.error('Error fetching all services for breadcrumbs:', error); return []; }
  return data;
}

// --- "Wow" Feature: Dynamically generates the breadcrumb trail ---
async function generateBreadcrumbs(currentSlug: string): Promise<Breadcrumb[]> {
  const allServices = await getAllServices();
  const serviceMap = new Map(allServices.map(s => [s.slug, s]));
  
  const path: Breadcrumb[] = [];
  let current = serviceMap.get(currentSlug);

  while (current) {
    path.unshift({ name: current.title, href: `/services/${current.slug}` });
    current = current.parent_service_slug ? serviceMap.get(current.parent_service_slug) : undefined;
  }
  // Add the static parent pages
  path.unshift({ name: 'Services', href: '/services' });
  path.unshift({ name: 'Home', href: '/' });
  return path;
}


// --- Metadata Generation ---
export async function generateMetadata({ params }: { params: { serviceSlug: string } }) {
  const service = await getServiceData(params.serviceSlug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.meta_title || service.title} | Bills On Solar`,
    description: service.meta_description || service.excerpt,
  };
}


// --- The Main Page Component ---
export default async function ServiceDetailPage({ params }: { params: { serviceSlug: string } }) {
  // Fetch page data and breadcrumbs in parallel for performance
  const [service, breadcrumbs] = await Promise.all([
    getServiceData(params.serviceSlug),
    generateBreadcrumbs(params.serviceSlug)
  ]);

  if (!service) { notFound(); }

  return (
    <>
      <PageHeader
        title={service.title}
        subtitle={service.excerpt || `Comprehensive details about our ${service.title} offering.`}
        backgroundImageUrl={service.hero_image_url || '/images/projects-hero-bg.jpg'} // Use a default BG
        breadcrumbs={breadcrumbs}
      />

      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            
            {/* Main Content Area */}
            <article className="w-full lg:w-2/3">
              {service.content_html && (
                <div 
                  className="prose lg:prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: service.content_html }} 
                />
              )}
            </article>

            {/* --- "Wow" Sticky Sidebar --- */}
            <aside className="w-full lg:w-1/3 mt-12 lg:mt-0">
              <div className="sticky top-28 space-y-8">
                
                {/* Key Features Card */}
                {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <h3 className="text-lg font-bold text-deep-night flex items-center gap-2 mb-4"><WrenchScrewdriverIcon className="h-5 w-5 text-solar-flare-end"/> Key Features</h3>
                        <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    {typeof feature === 'object' && feature.title ? (
                                        <>
                                            <span className="font-semibold text-gray-800">{feature.title}:</span>
                                            <span className="text-gray-600 ml-1">{feature.detail}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-600">{feature.toString()}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
                
                {/* Call to Action Card */}
                {service.call_to_action_label && (
                    <div className="bg-gradient-to-br from-deep-night to-slate-800 p-8 rounded-2xl shadow-xl text-center">
                        <h3 className="text-2xl font-bold text-white">Ready to Get Started?</h3>
                        <p className="text-gray-300 mt-2 mb-6">Let's discuss how this solution can power your future.</p>
                        <Link href={service.call_to_action_link || '/#contact-us'} className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                            {service.call_to_action_label} <ArrowRightIcon className="ml-2 h-5 w-5"/>
                        </Link>
                    </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}