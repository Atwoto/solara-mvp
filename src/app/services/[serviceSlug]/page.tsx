// src/app/services/[serviceSlug]/page.tsx
import PageHeader from '@/components/PageHeader'; // Your public PageHeader
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
// import Head from 'next/head'; // Not needed if using generateMetadata for Server Component
import { ServicePageData } from '@/types'; 
import NextImage from 'next/image'; 
import Link from 'next/link'; // <<--- IMPORT Link HERE

interface ServiceDetailPageProps {
  params: {
    serviceSlug: string;
  };
}

async function getServiceData(slug: string): Promise<ServicePageData | null> {
  const { data, error } = await supabase
    .from('service_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published') 
    .single();

  if (error) {
    console.error(`Error fetching service with slug "${slug}":`, error.message);
    return null;
  }
  return data as ServicePageData | null;
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const service = await getServiceData(params.serviceSlug);
  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }
  return {
    title: `${service.title} - Bills On Solar EA Limited`,
    description: service.excerpt || service.meta_description || `Learn more about our ${service.title} services.`,
    openGraph: {
        title: service.title,
        description: service.excerpt || service.meta_description,
        images: service.hero_image_url ? [{ url: service.hero_image_url }] : [],
    }
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const service = await getServiceData(params.serviceSlug);

  if (!service) {
    notFound(); 
  }

  return (
    <>
      <PageHeader 
        title={service.title}
        subtitle={service.excerpt || `Comprehensive details about our ${service.title} offering.`} // <<--- ADDED subtitle prop
      />

      <article className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          {service.hero_image_url && (
            <div className="mb-8 md:mb-12 relative w-full aspect-[16/7] sm:aspect-[2/1] lg:aspect-[16/6] rounded-lg overflow-hidden shadow-lg">
              <NextImage 
                src={service.hero_image_url} 
                alt={service.title} 
                fill 
                style={{objectFit: 'cover'}}
                priority 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              />
            </div>
          )}
          
          {service.content_html && (
            <div 
              className="prose lg:prose-lg xl:prose-xl max-w-none mx-auto" // Ensure you have @tailwindcss/typography for 'prose'
              dangerouslySetInnerHTML={{ __html: service.content_html }} 
            />
          )}

          {service.features && Array.isArray(service.features) && service.features.length > 0 && (
            <div className="mt-10 pt-8 border-t">
              <h3 className="text-2xl font-semibold mb-4 text-deep-night">Key Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                {service.features.map((feature, index) => (
                  typeof feature === 'string' ? 
                    <li key={index}>{feature}</li> :
                  typeof feature === 'object' && feature !== null && 'title' in feature && 'detail' in feature ? // Check for detail too
                    <li key={index}><strong>{feature.title}:</strong> {feature.detail}</li> : null
                ))}
              </ul>
            </div>
          )}
          
          {/* Call to Action */}
          {service.call_to_action_label && service.call_to_action_link && (
            <div className="mt-12 text-center">
                <Link href={service.call_to_action_link} className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                    {service.call_to_action_label}
                </Link>
            </div>
          )}
        </div>
      </article>
    </>
  );
}