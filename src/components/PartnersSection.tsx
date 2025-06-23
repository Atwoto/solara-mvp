// src/components/PartnersSection.tsx
'use client';

import NextImage from 'next/image';
import Link from 'next/link';

const technologyPartners = [
  { name: 'GoodWe', logoUrl: '/images/logos/goodwe.png', website: 'https://www.goodwe.com/' },
  { name: 'Huawei', logoUrl: '/images/logos/huawei.png', website: 'https://solar.huawei.com/' },
  { name: 'Hinen', logoUrl: '/images/logos/hinen.png', website: 'https://www.hinen.com/' },
  { name: 'Solis', logoUrl: '/images/logos/solis.png', website: 'https://www.solisinverters.com/' },
  { name: 'Victron Energy', logoUrl: '/images/logos/victron.png', website: 'https://www.victronenergy.com/' },
  { name: 'Fronius', logoUrl: '/images/logos/fronius.png', website: 'https://www.fronius.com/en/solar-energy' },
  { name: 'Ritar', logoUrl: '/images/logos/ritar.png', website: 'http://www.ritarpower.com/' },
];

const organizations = [
  { name: 'EPRA Kenya', logoUrl: '/images/logos/epra.png', website: 'https://www.epra.go.ke/' },
  { name: 'REREC', logoUrl: '/images/logos/rerec.png', website: 'https://www.rerec.co.ke/' },
  { name: 'Médecins Sans Frontières', logoUrl: '/images/logos/msf.png', website: 'https://www.msf.org/' },
  { name: 'Kenya Red Cross', logoUrl: '/images/logos/redcross.png', website: 'https://www.redcross.or.ke/' },
];

const LogoScroller = ({ logos, reverse = false }: { logos: { name: string; logoUrl: string; website: string }[]; reverse?: boolean }) => {
  const extendedLogos = [...logos, ...logos];

  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
    >
      <ul className={`flex items-center justify-start [&_li]:mx-8 [&_img]:max-w-none hover:[animation-play-state:paused] ${reverse ? 'animate-infinite-scroll-reverse' : 'animate-infinite-scroll'}`}>
        {extendedLogos.map((logo, index) => (
          <li key={`${logo.name}-${index}`}>
            <Link href={logo.website} target="_blank" rel="noopener noreferrer" className="group">
              <div className="relative h-24 w-40 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <NextImage
                  src={logo.logoUrl}
                  alt={`${logo.name} Logo`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                  sizes="160px"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PartnersSection = () => {
  return (
    <div className="bg-gray-50 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
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
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
              Our Technology Partners
            </h3>
            <LogoScroller logos={technologyPartners} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
              Organizations We Collaborate With
            </h3>
            <LogoScroller logos={organizations} reverse={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;