// src/app/about/page.tsx
import PageHeader from "@/components/PageHeader";

const AboutPage = () => {
  return (
    <>
      <PageHeader
        title="About Bills On Solar"
        subtitle="Powering a brighter, cleaner future for Kenya."
      />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-12">
            Our mission is to provide affordable, reliable, and sustainable solar energy solutions to homes and businesses across East Africa. We are committed to quality, innovation, and exceptional customer service.
          </p>
          <h2 className="text-3xl font-bold mb-8">Meet the Team</h2>
          <p className="text-lg text-gray-700">
            Our team of certified engineers and solar experts is ready to assist you. Full team bios coming soon!
          </p>
        </div>
      </main>
    </>
  );
};

export default AboutPage;