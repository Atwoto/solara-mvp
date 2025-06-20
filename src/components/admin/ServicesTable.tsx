// src/components/admin/ServicesTable.tsx
'use client';

import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ServicePageData } from '@/types'; // Your type for service page data
import { useRouter } from 'next/navigation'; // For refreshing data after delete

interface ServicesTableProps {
  services: ServicePageData[];
}

const ServicesTable = ({ services }: ServicesTableProps) => {
  const router = useRouter();

  const handleDeleteService = async (serviceId: string | undefined, serviceTitle: string) => {
    if (!serviceId) {
        alert("Cannot delete service: ID is missing.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete the service: "${serviceTitle}"?\nThis action CANNOT be undone and will also delete any associated image.`)) {
        return;
    }

    try {
      // API endpoint for deleting a specific service
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });
      
      // Check if the response body is empty or not JSON before trying to parse
      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : { message: 'Service deleted successfully (no content in response).' };
      } catch (e) {
        // If parsing fails but status is OK, assume success with no specific message body
        if (response.ok) {
            result = { message: 'Service deleted successfully (response not JSON).' };
        } else {
            throw new Error(responseText || 'Failed to delete service and received non-JSON response.');
        }
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete service');
      }
      
      alert(result.message || 'Service deleted successfully!');
      router.refresh(); // Re-fetches data for the current page, updating the list
    } catch (err: any) {
      console.error("Delete service error:", err);
      alert(`Error deleting service: ${err.message}`);
    }
  };

  if (!services || services.length === 0) {
    return <p className="text-gray-600 p-4 text-center bg-white rounded-lg shadow">No services found. Add one to get started!</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                <Link href={`/admin/services/edit/${service.id}`} className="text-sm font-medium text-gray-900 hover:text-solar-flare-start truncate block" title={service.title}>
                  {service.title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={service.slug}>{service.slug}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  service.status === 'published' ? 'bg-green-100 text-green-800' : 
                  service.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800' // for 'archived' or other statuses
                }`}>
                  {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.display_order}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {service.updated_at ? new Date(service.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {/* Public view link might not be applicable for all services or might need specific logic */}
                <Link href={`/services/${service.slug}`} target="_blank" className="text-sky-600 hover:text-sky-800 p-1 inline-flex items-center" title="View Live Service Page">
                    <EyeIcon className="h-5 w-5"/>
                </Link>
                <Link href={`/admin/services/edit/${service.id}`} className="text-indigo-600 hover:text-indigo-800 p-1 inline-flex items-center" title="Edit Service">
                  <PencilSquareIcon className="h-5 w-5"/>
                </Link>
                <button 
                  onClick={() => handleDeleteService(service.id, service.title)} 
                  className="text-red-600 hover:text-red-800 p-1 inline-flex items-center" 
                  title="Delete Service"
                  disabled={!service.id}
                >
                  <TrashIcon className="h-5 w-5"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;