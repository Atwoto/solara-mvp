// src/components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    // Removed all top padding and margin to eliminate white space
    // The component should start immediately after the sticky header
    <div className="bg-deep-night text-white pb-8 -mt-0"> 
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg mt-2 opacity-80 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;