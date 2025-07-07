// src/app/services/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { ServicePageData } from '@/types';
import { CheckBadgeIcon, WrenchScrewdriverIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ServiceDetailClient from '@/components/ServiceDetailClient';

// --- Data Fetching Function ---
// Fetches all published services to understand the parent-child relationships.
async function getAllServices(): Promise<ServicePageData[]> {
  const { data, error } = await supabase.from('service_pages').select('*').eq('status', 'published');
  if (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
  return data as ServicePageData[];
}

// --- Main Gateway Page Component ---
// This component acts as a router, deciding whether to show a category or a detail page.
export default async function ServicesGatewayPage({ params }: { params: { slug: string[] } }) {
  // The slug from a catch-all route is an array. We usually need the last part.
  const currentSlug = params.slug[params.slug.length - 1];

  const allServices = await getAllServices();

  // Find the specific page data for the current slug, if it exists.
  const servicePage = allServices.find(s => s.slug === currentSlug);

  // Find all services that list the current slug as their parent.
  const childServices = allServices.filter(s => s.parent_service_slug === currentSlug);

  // --- LOGIC ---
  // If the current slug has child services, display the category page.
  if (childServices.length > 0) {
    // A "parent" might be a real page or just a grouping concept. We handle both.
    const parentData = servicePage || { title: currentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), slug: currentSlug };
    return <ServiceCategoryPage parent={parentData} children={childServices} allServices={allServices} />;
  }

  // If it's a specific page with no children, display the detail page.
  if (servicePage) {
    return <ServiceDetailPage service={servicePage} allServices={allServices} />;
  }

  // If the slug doesn't match any page or category, show a 404 error.
  notFound();
}


// --- UI Component for a Category Page ---
function ServiceCategoryPage({ parent, children, allServices }: { parent: Partial<ServicePageData>, children: ServicePageData[], allServices: ServicePageData[] }) {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs currentSlug={parent.slug!} allServices={allServices} />
        <h1 className="text-3xl lg:text-4xl font-extrabold text-deep-night mb-4">{parent.title}</h1>
        <p className="text-lg text-gray-600 mb-12">Explore the services we offer under our {parent.title?.toLowerCase()} solutions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {children.map(service => (
            <Link href={`/services/${service.slug}`} key={service.id} className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 overflow-hidden">
              <div className="relative w-full h-56 bg-gray-200">
                {service.image_urls?.[0] ? (
                  <Image src={service.image_urls[0]} alt={service.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><WrenchScrewdriverIcon className="h-16 w-16 text-gray-300" /></div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-deep-night group-hover:text-solar-flare-end transition-colors">{service.title}</h3>
                {service.excerpt && <p className="text-gray-600 mt-2 text-sm line-clamp-3">{service.excerpt}</p>}
                <div className="mt-4 text-sm font-semibold text-solar-flare-end inline-flex items-center">
                  View Details <ChevronRightIcon className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- UI Component for a Detail Page ---
function ServiceDetailPage({ service, allServices }: { service: ServicePageData, allServices: ServicePageData[] }) {
  return (
    <>
      <div className="bg-white pt-10 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs currentSlug={service.slug} allServices={allServices} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* By ensuring 'service' is valid before rendering, we prevent client-side errors. */}
            <ServiceDetailClient imageUrls={service.image_urls} serviceTitle={service.title} />
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-deep-night mb-3">{service.title}</h1>
              <p className="text-base text-gray-600 leading-relaxed">{service.excerpt}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            <article className="w-full lg:w-2/3">
              <h2 className="text-2xl font-bold text-deep-night mb-4">Service Details</h2>
              {service.content_html && <div className="prose lg:prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: service.content_html }} />}
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
                            {typeof feature === 'object' && feature.title ? (<><span className="font-semibold text-gray-800">{feature.title}:</span><span className="text-gray-600 ml-1">{feature.detail}</span></>) : (<span className="text-gray-600">{feature.toString()}</span>)}
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

// --- Reusable Breadcrumbs Component ---
function Breadcrumbs({ currentSlug, allServices }: { currentSlug: string, allServices: ServicePageData[] }) {
    const serviceMap = new Map(allServices.map(s => [s.slug, s]));
    const path: { name: string; href: string }[] = [];
    let current = serviceMap.get(currentSlug);
    while (current) {
        path.unshift({ name: current.title, href: `/services/${current.slug}` });
        current = current.parent_service_slug ? serviceMap.get(current.parent_service_slug) : undefined;
    }
    path.unshift({ name: 'Services', href: '#' }); // Main services link can be '#' or a future overview page
    path.unshift({ name: 'Home', href: '/' });
    return (
        <nav className="mb-8 text-sm text-gray-500">
            {path.map((crumb, index) => (
                <span key={crumb.href}>
                    <Link href={crumb.href} className="hover:text-solar-flare-start transition-colors">{crumb.name}</Link>
                    {index < path.length - 1 && <span className="mx-2">/</span>}
                </span>
            ))}
        </nav>
    );
}
