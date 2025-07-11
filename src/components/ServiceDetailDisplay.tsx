// src/components/ServiceDetailDisplay.tsx
import Link from 'next/link';
import { ServicePageData, ServiceCategory } from '@/types';
import ServiceDetailClient from '@/components/ServiceDetailClient';
import { CheckBadgeIcon, WrenchScrewdriverIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// Helper to build breadcrumbs for nested items
function buildBreadcrumbs(slug: string, allCategories: ServiceCategory[]) {
    const serviceMap = new Map(allCategories.map(s => [s.slug, s]));
    const path: { name: string; href: string }[] = [];
    let current: ServiceCategory | undefined = serviceMap.get(slug);

    // --- THIS IS THE FIX ---
    // This loop is restructured to be more explicit and satisfy the TypeScript compiler.
    while (current) {
        // Add the current item to the front of the path
        path.unshift({ name: current.name, href: `/services/${current.slug}` });

        // Find the parent of the current item, if a parent_id exists
        const parentId = current.parent_id;
        if (parentId) {
            // Find the full parent category object from the main list
            current = allCategories.find(c => c.id === parentId);
        } else {
            // If there is no parent_id, we've reached the top of this branch, so we stop the loop.
            current = undefined;
        }
    }
    
    path.unshift({ name: 'Services', href: '#' }); 
    path.unshift({ name: 'Home', href: '/' });

    return path;
}

// This component displays the full details of a created service page.
export default function ServiceDetailDisplay({ service, allCategories }: { service: ServicePageData, allCategories: ServiceCategory[] }) {
    const breadcrumbs = buildBreadcrumbs(service.slug, allCategories);
    return (
        <>
          <div className="bg-white pt-10 pb-16">
            <div className="container mx-auto px-4">
              <nav className="mb-8 text-sm text-gray-500">
                  {breadcrumbs.map((crumb, index) => (
                      <span key={index}>
                          {crumb.href !== '#' ? (
                            <Link href={crumb.href} className="hover:text-solar-flare-start transition-colors">{crumb.name}</Link>
                          ) : (
                            <span className="text-gray-800">{crumb.name}</span>
                          )}
                          {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                      </span>
                  ))}
              </nav>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                  <ServiceDetailClient 
                    imageUrls={service.image_urls} 
                    serviceTitle={service.title} 
                  />
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
