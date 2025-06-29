// src/app/services/[serviceSlug]/page.tsx
import { notFound } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { CheckBadgeIcon, WrenchScrewdriverIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// Type for our breadcrumb generation
interface Breadcrumb { name: string; href: string; }

// --- Data Fetching Functions ---
async function getServiceData(slug: string): Promise<ServicePageData | null> {
  const { data, error } = await supabase.from('service_pages').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) { console.error(`Error fetching service '${slug}':`, error); return null; }
  
  // --- DEBUGGING: Log the fetched data on the server ---
  console.log(`[Service Page Data for ${slug}]:`, JSON.stringify(data, null, 2));

  return data;
}

async function getAllServices(): Promise<Pick<ServicePageData, 'slug' | 'title' | 'parent_service_slug'>[]> {
  const { data, error } = await supabase.from('service_pages').select('slug, title, parent_service_slug').eq('status', 'published');
  if (error) { console.error('Error fetching all services for breadcrumbs:', error); return []; }
  return data;
}

async function generateBreadcrumbs(currentSlug: string): Promise<Breadcrumb[]> {
  const allServices = await getAllServices();
  const serviceMap = new Map(allServices.map(s => [s.slug, s]));
  const path: Breadcrumb[] = [];
  let current = serviceMap.get(currentSlug);
  while (current) {
    path.unshift({ name: current.title, href: `/services/${current.slug}` });
    current = current.parent_service_slug ? serviceMap.get(current.parent_service_slug) : undefined;
  }
  path.unshift({ name: 'Services', href: '/services' });
  path.unshift({ name: 'Home', href: '/' });
  return path;
}

// Metadata Generation
export async function generateMetadata({ params }: { params: { serviceSlug: string } }) {
  const service = await getServiceData(params.serviceSlug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.meta_title || service.title} | Bills On Solar`,
    description: service.meta_description || service.excerpt,
    openGraph: {
      images: service.image_urls?.[0] ? [service.image_urls[0]] : [],
    },
  };
}

// --- The Main Page Component ---
export default async function ServiceDetailPage({ params }: { params: { serviceSlug: string } }) {
  const [service, breadcrumbs] = await Promise.all([
    getServiceData(params.serviceSlug),
    generateBreadcrumbs(params.serviceSlug)
  ]);

  if (!service) { notFound(); }

  const mainImageUrl = service.image_urls?.[0] || '/images/default-placeholder.jpg'; // Have a reliable fallback
  
  return (
    <>
      <div className="bg-white pt-10 pb-16">
        <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href}>
                        <Link href={crumb.href} className="hover:text-solar-flare-start transition-colors">
                            {crumb.name}
                        </Link>
                        {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                    </span>
                ))}
            </nav>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* --- ROBUST Image Gallery --- */}
                <div className="flex flex-col gap-4 sticky top-24">
                    <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-lg border bg-gray-100">
                        <NextImage
                            src={mainImageUrl}
                            alt={`Main image for ${service.title}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Thumbnails */}
                    {service.image_urls && service.image_urls.length > 1 && (
                        <div className="grid grid-cols-5 gap-3">
                        {service.image_urls.map((url) => (
                            <div key={url} className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-solar-flare-start transition-all">
                                <NextImage
                                    src={url}
                                    alt={`${service.title} thumbnail`}
                                    fill
                                    className="object-cover"
                                />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label="View full image"></a>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-deep-night mb-3">{service.title}</h1>
                    <p className="text-base text-gray-600 leading-relaxed">{service.excerpt}</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Main Content & Features Section */}
      <div className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            <article className="w-full lg:w-2/3">
              <h2 className="text-2xl font-bold text-deep-night mb-4">Service Details</h2>
              {service.content_html && (
                <div 
                  className="prose lg:prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: service.content_html }} 
                />
              )}
            </article>
            <aside className="w-full lg:w-1/3 mt-12 lg:mt-0">
              <div className="sticky top-24 space-y-8">
                {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border">
                        <h3 className="text-lg font-bold text-deep-night flex items-center gap-2 mb-4"><WrenchScrewdriverIcon className="h-5 w-5 text-solar-flare-end"/> Key Features</h3>
                        <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    {typeof feature === 'object' && feature.title ? (
                                        <><span className="font-semibold text-gray-800">{feature.title}:</span><span className="text-gray-600 ml-1">{feature.detail}</span></>
                                    ) : (<span className="text-gray-600">{feature.toString()}</span>)}
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
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