import { notFound } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { CheckBadgeIcon, WrenchScrewdriverIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// --- Type for our breadcrumb generation ---
interface Breadcrumb { name: string; href: string; }

// --- Data Fetching Functions (No changes needed here) ---
async function getServiceData(slug: string): Promise<ServicePageData | null> {
  const { data, error } = await supabase.from('service_pages').select('*').eq('slug', slug).eq('status', 'published').single();
  if (error) { console.error(`Error fetching service '${slug}':`, error); return null; }
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

// --- Metadata Generation (Updated to use new column name) ---
export async function generateMetadata({ params }: { params: { serviceSlug: string } }) {
  const service = await getServiceData(params.serviceSlug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.meta_title || service.title} | Bills On Solar`,
    description: service.meta_description || service.excerpt,
    openGraph: {
      images: service.image_urls?.[0] ? [service.image_urls[0]] : [], // Use first image for social sharing
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

  // Use the first image as the default "main" image
  const mainImageUrl = service.image_urls?.[0] || '/images/projects-hero-bg.jpg';
  
  return (
    <>
      {/* --- UPGRADED HERO SECTION with Image Gallery --- */}
      <div className="bg-deep-night text-white pt-10 pb-20">
        <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href}>
                        <Link href={crumb.href} className="text-gray-300 hover:text-white transition-colors">
                            {crumb.name}
                        </Link>
                        {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-500">/</span>}
                    </span>
                ))}
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Text Content */}
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">{service.title}</h1>
                    <p className="text-lg text-gray-300 max-w-2xl">{service.excerpt || `Comprehensive details about our ${service.title} offering.`}</p>
                </div>
                {/* Image Gallery */}
                <div className="w-full">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                        <NextImage
                            src={mainImageUrl}
                            alt={service.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                     {/* Thumbnails */}
                    {service.image_urls && service.image_urls.length > 1 && (
                        <div className="flex space-x-3 overflow-x-auto mt-4 p-1">
                        {service.image_urls.map((url) => (
                            <div key={url} className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-solar-flare-start transition-all">
                                <NextImage
                                    src={url}
                                    alt={`${service.title} thumbnail`}
                                    fill
                                    className="object-cover"
                                />
                                <Link href={url} target="_blank" className="absolute inset-0" aria-label="View full image"></Link>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* --- Main Content Section (Same as before) --- */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            <article className="w-full lg:w-2/3">
              {service.content_html && (
                <div 
                  className="prose lg:prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: service.content_html }} 
                />
              )}
            </article>
            <aside className="w-full lg:w-1/3 mt-12 lg:mt-0">
              <div className="sticky top-28 space-y-8">
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