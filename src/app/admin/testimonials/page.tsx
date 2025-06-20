// src/app/admin/testimonials/page.tsx
'use client';

// REMOVED AdminLayout import - it's already provided by /admin/layout.tsx
import { useState, useCallback, useEffect } from 'react';
import { Testimonial } from '@/types';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

// Auth logic is handled by AdminLayout component, so we can keep this page clean
const AdminTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch ALL testimonials for admin (approved and unapproved)
      const response = await fetch('/api/admin/testimonials/all');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch testimonials');
      }
      const data: Testimonial[] = await response.json();
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleApproveToggle = async (testimonialId: string, currentApprovedStatus: boolean | null | undefined) => {
    const newApprovedStatus = !currentApprovedStatus;
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: newApprovedStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update approval status');
      
      // Update local state
      setTestimonials(prev => 
        prev.map(t => t.id === testimonialId ? { ...t, approved: newApprovedStatus } : t)
      );
      alert(`Testimonial ${newApprovedStatus ? 'approved' : 'unapproved'} successfully!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleDeleteTestimonial = async (testimonialId: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to delete the testimonial from "${clientName}"?\nThis action cannot be undone.`)) {
        return;
    }
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to delete testimonial');
      alert(result.message || 'Testimonial deleted successfully!');
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading && testimonials.length === 0 && !error) {
    return <div className="p-6 text-center">Loading testimonials...</div>;
  }

  return (
    // REMOVED AdminLayout wrapper - it's already provided by /admin/layout.tsx
    <>
      <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8 pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Testimonials</h1>
      </div>

      {error && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote (Excerpt)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading && testimonials.length === 0 && !error && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">No testimonials found.</td></tr>
              )}
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{testimonial.client_name}</div>
                    <div className="text-xs text-gray-500">{testimonial.client_title_company}</div>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm text-gray-700 truncate" title={testimonial.quote}>{testimonial.quote}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testimonial.rating ? `${testimonial.rating} ★` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleApproveToggle(testimonial.id, testimonial.approved)}
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                        testimonial.approved ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                      title={testimonial.approved ? "Click to Unapprove" : "Click to Approve"}
                    >
                      {testimonial.approved ? 
                        <CheckCircleIcon className="h-4 w-4 mr-1" /> : 
                        <XCircleIcon className="h-4 w-4 mr-1" />
                      }
                      {testimonial.approved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                        onClick={() => handleDeleteTestimonial(testimonial.id, testimonial.client_name)} 
                        className="text-red-600 hover:text-red-800 p-1" title="Delete Testimonial">
                      <TrashIcon className="h-5 w-5 inline-block"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminTestimonialsPage;