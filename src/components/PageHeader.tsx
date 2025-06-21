// src/components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    // <<--- CHANGE IS HERE: Added pt-8 (32px padding-top) ---
    // This adds a bit of breathing room inside the dark background.
    <div className="bg-deep-night text-white pt-8 pb-8"> 
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg mt-2 opacity-80 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;