'use client';

import Image from 'next/image'; // <-- THIS WAS THE MISSING LINE
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { BoltIcon, NewspaperIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline';

const stats = [
  { value: 300, label: 'MW Worth of Projects', icon: BoltIcon },
  { value: 10, label: 'Latest Projects', icon: NewspaperIcon },
  { value: 18, label: 'Certifications', icon: ShieldCheckIcon },
  { value: 25, label: 'Expert Staff', icon: UsersIcon },
];

const StatCard = ({ stat }: { stat: typeof stats[0] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1,    
  });

  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className="
        text-center p-6 sm:p-8 
        bg-white/5 
        backdrop-blur-sm 
        border border-white/10 
        rounded-2xl 
        transition-all duration-300
        hover:bg-white/10
        hover:border-solar-flare-start/50
        hover:-translate-y-2
      "
    >
      <Icon className="h-10 w-10 mx-auto mb-4 text-solar-flare-start" />
      <div className="text-4xl sm:text-5xl font-bold text-white tracking-tighter">
        <CountUp start={0} end={inView ? stat.value : 0} duration={2.5} />
        {stat.label.includes('MW') && '+'}
      </div>
      <p className="mt-2 text-sm text-gray-400 uppercase tracking-wider">
        {stat.label}
      </p>
    </div>
  );
};

const StatsCounter = () => {
  return (
    <section className="relative py-16 sm:py-24 bg-deep-night text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-5">
        <Image
          src="/images/hero-bg-2.jpg" 
          alt="Solar panels background"
          fill
          sizes="100vw" // Added sizes prop to prevent console warnings
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Our Proven Track Record
          </h2>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
            Decades of experience and successful projects have made us a trusted leader in solar energy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;