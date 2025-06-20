// src/app/admin/blog/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
// REMOVE: import AdminLayout from '@/components/admin/AdminLayout'; // No longer needed here
import { BlogPost } from '@/types';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/admin/PageHeader'; // For consistent page titles
import PageLoader from '@/components/PageLoader';     // For consistent loading states

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com';

const AdminBlogPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/blog/all'); 
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch articles');
      }
      const data: BlogPost[] = await response.json();
      setArticles(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching articles for admin:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      fetchArticles();
    }
  }, [status, session, fetchArticles]); 

  // Page-level Security Guard
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/blog`);
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/');
    }
  }, [session, status, router]);


  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the article: "${articleTitle}"?\nThis action cannot be undone.`)) {
        return;
    }
    try {
      const response = await fetch(`/api/admin/blog/${articleId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete article');
      }
      alert(result.message || 'Article deleted successfully!');
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (err: any) {
      console.error("Delete article error:", err);
      alert(`Error deleting article: ${err.message}`);
    }
  };

  // Let src/app/admin/layout.tsx (using AdminLayoutComponent) handle the main loading/auth UI
  if (status === 'loading') {
    return <div className="p-6"><PageLoader message="Loading articles page..." /></div>;
  }
  if (status !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    // The <AdminLayout> wrapper is applied by src/app/admin/layout.tsx
    <>
      <PageHeader
        title="Manage Articles"
        description="Create, edit, and manage your blog posts."
      >
        <Link href="/admin/blog/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Article
        </Link>
      </PageHeader>

      {error && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</div>}

      {isLoading && articles.length === 0 && !error && (
          <div className="text-center py-10"><PageLoader message="Loading articles..." /></div>
      )}
      
      {!isLoading && articles.length === 0 && !error && (
          <div className="text-center py-10 text-gray-500">
            <p>No articles found.</p>
            <Link href="/admin/blog/new" className="text-solar-flare-start hover:underline mt-2 inline-block">
                Write your first article
            </Link>
          </div>
      )}

      {articles.length > 0 && (
        <div className="px-4 sm:px-0 lg:px-0 py-4"> {/* Adjusted padding to align with PageHeader parent if needed, or remove if PageHeader handles it */}
          <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => {
                  const isPublished = article.published_at && new Date(article.published_at) <= new Date();
                  const publishedDateString = article.published_at 
                      ? new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : 'Not Set';
                  const createdDateString = new Date(article.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate" title={article.title}>{article.title}</div>
                        <div className="text-xs text-gray-500 truncate">Slug: {article.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.category || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isPublished ? 'bg-green-100 text-green-800' : 
                            (article.published_at ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {isPublished ? 'Published' : (article.published_at ? 'Scheduled' : 'Draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publishedDateString}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{createdDateString}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/blog/${article.slug}`} target="_blank" className="text-sky-600 hover:text-sky-800 p-1 inline-flex items-center" title="View Live Article">
                              <EyeIcon className="h-5 w-5"/>
                        </Link>
                        <Link href={`/admin/blog/edit/${article.id}`} className="text-indigo-600 hover:text-indigo-800 p-1 inline-flex items-center" title="Edit Article">
                            <PencilSquareIcon className="h-5 w-5"/>
                        </Link>
                        <button 
                            onClick={() => handleDeleteArticle(article.id, article.title)} 
                            className="text-red-600 hover:text-red-800 p-1 inline-flex items-center" 
                            title="Delete Article"
                        >
                          <TrashIcon className="h-5 w-5"/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBlogPage;