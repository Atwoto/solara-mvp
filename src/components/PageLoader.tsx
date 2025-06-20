// src/components/PageLoader.tsx

interface PageLoaderProps {
    message?: string;
    className?: string; // Optional additional className for the wrapper
}

const PageLoader = ({ message = "Loading...", className = "" }: PageLoaderProps) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-solar-flare-start"></div>
      {message && <p className="text-md text-gray-600">{message}</p>}
    </div>
  );
};

export default PageLoader;