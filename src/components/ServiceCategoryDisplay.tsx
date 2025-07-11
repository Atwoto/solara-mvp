// src/components/ServiceCategoryDisplay.tsx
import Link from 'next/link';
import { ServiceCategory } from '@/types';
import PageHeader from '@/components/PageHeader';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

// This component displays a list of sub-categories.
export default function ServiceCategoryDisplay({ category, children, allCategories }: { 
  category: ServiceCategory; 
  children: ServiceCategory[];
  allCategories: ServiceCategory[];
}) {
  return (
    <>
      <PageHeader
        title={category.name}
        subtitle={category.description || `Explore our range of ${category.name.toLowerCase()} solutions.`}
        // --- THIS IS THE FIX ---
        // Added a default href for the 'Services' breadcrumb
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '#' }, { name: category.name, href: `/services/${category.slug}` }]}
      />
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children.map(service => (
              <Link href={`/services/${service.slug}`} key={service.id} className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 overflow-hidden p-8">
                <h3 className="text-xl font-bold text-deep-night group-hover:text-solar-flare-end transition-colors">{service.name}</h3>
                {service.description && <p className="text-gray-600 mt-2 text-sm line-clamp-3">{service.description}</p>}
                <div className="mt-6 text-sm font-semibold text-solar-flare-end inline-flex items-center">
                  View Details <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
