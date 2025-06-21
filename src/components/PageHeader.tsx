// src/components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    // --- FIX: Changed py-16 to pb-16 to remove top padding ---
    // The main content area in layout.tsx already has pt-[60px] to offset the sticky header.
    // This component should not add more top padding.
    <div className="bg-deep-night text-white pb-8 pt-8 sm:pt-12"> {/* Changed to pb-16 and added some smaller top padding */}
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg mt-2 opacity-80 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;