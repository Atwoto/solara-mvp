// app/services/residential/page.tsx
import PageHeader from '@/components/PageHeader'; // Your existing PageHeader
import Head from 'next/head'; // Or use Next.js 13+ metadata API
import Link from 'next/link';
import NextImage from 'next/image'; // For images

export default function ResidentialServicesPage() {
  const pageTitle = "Residential Solar Solutions";
  const metaDescription = "Power your home with clean, reliable solar energy. Explore our residential solar panel installation, hybrid systems, and power backup solutions.";

  // --- THIS IS THE FIX ---
  // All 'href' values have been changed to '/projects'
  const residentialOfferings = [
    {
      name: "Solar Hybrid Systems Installation",
      description: "Combine solar power with battery storage for energy independence and backup during outages. Available in various capacities (3kW, 5kW, 8kW, etc.).",
      href: "/projects",
      icon: "☀️🔋"
    },
    {
      name: "Grid-Tied Solar Systems",
      description: "Reduce your electricity bills by generating your own solar power and feeding excess back to the grid (where applicable).",
      href: "/projects",
      icon: "☀️➡️🏢"
    },
    {
      name: "Off-Grid Solar Solutions",
      description: "Complete energy independence for remote homes or locations without grid access. Custom designed for your energy needs.",
      href: "/projects",
      icon: "☀️🏕️"
    },
    {
      name: "Power Backup Systems",
      description: "Ensure uninterrupted power with our reliable battery backup solutions, integrated with or without solar.",
      href: "/projects",
      icon: "🔋💡"
    }
  ];

  return (
    <>
      <Head>
        <title>{`${pageTitle} - Bills On Solar EA Limited`}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <PageHeader
        title={pageTitle}
        subtitle="Customized solar energy solutions for your home."
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Our Residential Offerings</h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive range of solar installation services tailored to meet the unique energy demands of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {residentialOfferings.map((service) => (
              <div key={service.name} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-deep-night mb-2">{service.name}</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{service.description}</p>
                <Link href={service.href} legacyBehavior>
                  <a className="inline-block text-sm font-medium text-solar-flare-start hover:text-solar-flare-end transition-colors">
                    Learn More →
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Ready to have Solar at Home?</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-8">
                Contact us today for a free consultation and a personalized quote for your residential solar needs.
            </p>
            <Link href="/#contact-us" legacyBehavior>
                <a className="inline-block px-8 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105">
                    Get a Free Quote
                </a>
            </Link>
        </div>
      </section>
    </>
  );
}
