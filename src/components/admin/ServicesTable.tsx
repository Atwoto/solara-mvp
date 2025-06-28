'use client';

import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, EyeIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { ManagedService } from '@/app/admin/services/page'; // Import the type from the page component
import { useRouter } from 'next/navigation';

interface ServicesTableProps {
  services: ManagedService[];
  onRefresh: () => void; // A function to re-fetch the data
}

const ServicesTable = ({ services, onRefresh }: ServicesTableProps) => {
  const router = useRouter();

  const handleDeleteService = async (serviceId: string | undefined, serviceTitle: string) => {
    if (!serviceId) return alert("Cannot delete: ID is missing.");
    if (!window.confirm(`Are you sure you want to delete the page for: "${serviceTitle}"?`)) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      alert(result.message || 'Service page deleted successfully!');
      onRefresh(); // Call the passed-in refresh function
    } catch (err: any) {
      alert(`Error deleting service: ${err.message}`);
    }
  };

  if (!services || services.length === 0) {
    return <p className="p-4 text-center">No service types found. Check your `serviceOptions.ts` file.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.slug} className={`transition-colors duration-150 ${!service.isCreated ? 'bg-yellow-50/50' : 'hover:bg-gray-50'}`}>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-sm font-medium text-gray-900">{service.label}</p>
                <p className="text-xs text-gray-500">{service.slug}</p>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {service.isCreated && service.dbData ? (
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.dbData.status === 'published' ? 'bg-green-100 text-green-800' : 
                    service.dbData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {service.dbData.status?.charAt(0).toUpperCase() + service.dbData.status?.slice(1)}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                    Not Created
                  </span>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {service.dbData?.updated_at ? new Date(service.dbData.updated_at).toLocaleDateString() : '—'}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {service.isCreated && service.dbData ? (
                  <>
                    <Link href={`/services/${service.slug}`} target="_blank" className="text-sky-600 hover:text-sky-800 p-1 inline-flex items-center" title="View Live Page">
                        <EyeIcon className="h-5 w-5"/>
                    </Link>
                    <Link href={`/admin/services/edit/${service.dbData.id}`} className="text-indigo-600 hover:text-indigo-800 p-1 inline-flex items-center" title="Edit Page">
                      <PencilSquareIcon className="h-5 w-5"/>
                    </Link>
                    <button onClick={() => handleDeleteService(service.dbData?.id, service.label)} className="text-red-600 hover:text-red-800 p-1 inline-flex items-center" title="Delete Page">
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </>
                ) : (
                  <Link href="/admin/services/new" className="text-green-600 hover:text-green-800 p-1 inline-flex items-center text-xs font-semibold" title="Create Page">
                    <PlusCircleIcon className="h-5 w-5 mr-1"/> Create Page
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;