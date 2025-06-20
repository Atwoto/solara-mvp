// src/components/PartnersSection.tsx (Renamed from TeamSection.tsx)
'use client';

import NextImage from 'next/image';
import Link from 'next/link';

// Data for Technology Partners' logos
const technologyPartners = [
  { name: 'GoodWe', logoUrl: '/images/logos/goodwe.png', website: 'https://www.goodwe.com/' },
  { name: 'Huawei', logoUrl: '/images/logos/huawei.png', website: 'https://solar.huawei.com/' },
  { name: 'Hinen', logoUrl: '/images/logos/hinen.png', website: 'https://www.hinen.com/' },
  { name: 'Solis', logoUrl: '/images/logos/solis.png', website: 'https://www.solisinverters.com/' },
  { name: 'Victron Energy', logoUrl: '/images/logos/victron.png', website: 'https://www.victronenergy.com/' },
  { name: 'Fronius', logoUrl: '/images/logos/fronius.png', website: 'https://www.fronius.com/en/solar-energy' },
  { name: 'Ritar', logoUrl: '/images/logos/ritar.png', website: 'http://www.ritarpower.com/' },
];

// Data for Regulatory & Organizational logos
const organizations = [
  { name: 'EPRA Kenya', logoUrl: '/images/logos/epra.png', website: 'https://www.epra.go.ke/' },
  { name: 'REREC', logoUrl: '/images/logos/rerec.png', website: 'https://www.rerec.co.ke/' },
  { name: 'Médecins Sans Frontières', logoUrl: '/images/logos/msf.png', website: 'https://www.msf.org/' },
  { name: 'Kenya Red Cross', logoUrl: '/images/logos/redcross.png', website: 'https://www.redcross.or.ke/' },
];


const PartnersSection = () => {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        
        {/* Main Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
            TRUSTED BY THE BEST
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite">
            Our Partners & Collaborators
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We are proud to work with leading technology brands and esteemed organizations to deliver top-tier solar solutions across Kenya.
          </p>
        </div>

        {/* Technology Partners Subsection */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
            Our Technology Partners
          </h3>
          <div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 lg:mx-0 lg:max-w-none lg:grid-cols-7">
            {technologyPartners.map((partner) => (
              <Link key={partner.name} href={partner.website} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative h-20 w-full transition-transform duration-300 ease-in-out group-hover:scale-110">
                  <NextImage
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                    sizes="150px"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Organizations Subsection */}
        <div>
          <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
            Organizations We Have Worked With
          </h3>
          <div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-4 lg:mx-0 lg:max-w-none">
            {organizations.map((org) => (
              <Link key={org.name} href={org.website} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative h-24 w-full transition-transform duration-300 ease-in-out group-hover:scale-110">
                  <NextImage
                    src={org.logoUrl}
                    alt={`${org.name} Logo`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                    sizes="200px"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PartnersSection;