// src/app/admin/blog/edit/[articleId]/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Removed notFound as we'll handle with error state
import { useSession } from 'next-auth/react';
// REMOVE: import AdminLayout from '@/components/admin/AdminLayout'; // No longer needed here
import { BlogPost, BLOG_POST_CATEGORIES, BlogPostCategory } from '@/types'; 
import Image from 'next/image';
import TipTapEditor from '@/components/admin/TipTapEditor';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader'; // For consistent page titles
import PageLoader from '@/components/PageLoader';     // For consistent loading states

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

type ArticleFormData = {
  title: string;
  slug: string;
  category: BlogPostCategory | '';
  excerpt: string;
  content: string;
  author_name: string;
  published_at_date: string; 
  published_at_time: string; 
  imageFile: File | null; 
  currentImageUrl?: string | null; 
};

const EditArticlePage = () => {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.articleId as string | undefined; // Get articleId from URL params

  const { data: session, status: sessionStatus } = useSession();
  
  const [formData, setFormData] = useState<ArticleFormData | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Security Guard (Page Level)
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (sessionStatus === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/blog/edit/${articleId}`);
    } else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/');
    }
  }, [session, sessionStatus, router, articleId]);

  // Fetch existing article data
  useEffect(() => {
    if (!articleId || sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
      // If not authenticated/authorized, the main guard will redirect.
      // If no articleId, we can't fetch.
      if (!articleId && sessionStatus === 'authenticated') setIsLoadingData(false); // Stop loading if no ID but authenticated
      return;
    }

    const fetchArticleData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        // API endpoint to fetch a single article by ID for admin
        const response = await fetch(`/api/admin/blog/${articleId}`); // Assumes dynamic route for single article
        if (!response.ok) {
          if (response.status === 404) throw new Error('Article not found.');
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch article data');
        }
        const article: BlogPost = await response.json();

        let pDate = '';
        let pTime = '00:00'; // Default time if not set
        if (article.published_at) {
          const pubDateObj = new Date(article.published_at);
          pDate = pubDateObj.toISOString().split('T')[0]; 
          pTime = pubDateObj.toTimeString().split(' ')[0].substring(0, 5); 
        }

        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          category: (article.category as BlogPostCategory) || '',
          excerpt: article.excerpt || '',
          content: article.content || '<p></p>', // Ensure content is not null for TipTap
          author_name: article.author_name || session?.user?.name || session?.user?.email || '',
          published_at_date: pDate,
          published_at_time: pTime,
          imageFile: null, 
          currentImageUrl: article.image_url || null, // Corrected: image_url from BlogPost to imageUrl
        });
        if(article.image_url) setImagePreview(article.image_url); // Corrected

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching article for edit:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchArticleData();
  }, [articleId, session, sessionStatus]); // Rerun if articleId or session changes

  // Slug is usually not auto-generated on edit to maintain URL integrity,
  // but if you want to allow it or auto-update if title changes and slug was derived:
  // useEffect(() => { ... slug generation logic if needed ... }, [formData?.title]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleContentChange = (richText: string) => {
    setFormData(prev => prev ? { ...prev, content: richText } : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) { setError('Invalid file type.'); e.target.value = ''; return; }
      if (file.size > 5 * 1024 * 1024) { setError('File too large (max 5MB).'); e.target.value = ''; return; }
      setError(null);

      setFormData(prev => prev ? { ...prev, imageFile: file } : null);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => prev ? { ...prev, imageFile: null } : null);
      setImagePreview(formData?.currentImageUrl || null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) { setError("Form data is not available."); return; }
    if (!articleId) { setError("Article ID is missing. Cannot update."); return; }
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim() || formData.content === '<p></p>') {
        setError("Title, Slug, and Content are required."); return;
    }
    if (!formData.category) { setError("Please select a category."); return; }

    setIsSubmitting(true); setError(null); setSuccessMessage(null);

    const dataToSubmit = new FormData();
    dataToSubmit.append('title', formData.title.trim());
    dataToSubmit.append('slug', formData.slug.trim()); // Consider if slug should be updatable
    dataToSubmit.append('category', formData.category);
    dataToSubmit.append('excerpt', formData.excerpt.trim());
    dataToSubmit.append('content', formData.content);
    dataToSubmit.append('author_name', formData.author_name.trim() || (session?.user?.name || session?.user?.email || 'Admin'));
    
    if (formData.published_at_date) {
        const dateTimeString = `${formData.published_at_date}T${formData.published_at_time || '00:00:00'}`;
        const localDate = new Date(dateTimeString);
        if (!isNaN(localDate.getTime())) {
            dataToSubmit.append('published_at', localDate.toISOString());
        } else {
            // Optionally send empty string or 'null' string to clear date
            dataToSubmit.append('published_at', ''); 
        }
    } else {
        dataToSubmit.append('published_at', ''); // To unpublish or clear the date
    }

    if (formData.imageFile) {
      dataToSubmit.append('imageFile', formData.imageFile);
    }
    dataToSubmit.append('currentImageUrl', formData.currentImageUrl || ''); // Send current image URL


    try {
      const response = await fetch(`/api/admin/blog/${articleId}`, { 
        method: 'PUT', 
        body: dataToSubmit, 
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update article');

      setSuccessMessage(result.message || 'Article updated successfully!');
      if(result.article) { // Update form with potentially modified data from server (e.g., new image URL)
        const updatedArticle = result.article as BlogPost;
        let pDate = ''; let pTime = '00:00';
        if (updatedArticle.published_at) {
          const pubDateObj = new Date(updatedArticle.published_at);
          pDate = pubDateObj.toISOString().split('T')[0];
          pTime = pubDateObj.toTimeString().split(' ')[0].substring(0, 5);
        }
        setFormData({
            title: updatedArticle.title, slug: updatedArticle.slug,
            category: (updatedArticle.category as BlogPostCategory) || '',
            excerpt: updatedArticle.excerpt || '', content: updatedArticle.content,
            author_name: updatedArticle.author_name || '',
            published_at_date: pDate, published_at_time: pTime,
            imageFile: null, // Clear image file after successful upload/update
            currentImageUrl: updatedArticle.image_url || null,
        });
        if(updatedArticle.image_url) {setImagePreview(updatedArticle.image_url);} else {setImagePreview(null);}
      }
      // router.refresh(); // Could also just refresh data on the /admin/blog page
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const pageIsLoadingOrAccessDenied = sessionStatus === 'loading' || isLoadingData;

  if (pageIsLoadingOrAccessDenied) {
    return <div className="p-6"><PageLoader message="Loading article data..." /></div>;
  }
  if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>;
  }
  if (!formData && !isLoadingData) { // Error fetching or article not found
    return (
        <div className="p-6 text-center">
            <PageHeader title="Error" description={error || "Article could not be loaded."} showBackButton={true} backButtonHref="/admin/blog" />
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
  }
  if (!formData) return null; // Should be caught by above logic

  return (
    // The <AdminLayout> wrapper is applied by src/app/admin/layout.tsx
    <>
      <PageHeader
        title="Edit Article"
        description={`You are editing: ${formData.title || 'article'}`}
        showBackButton={true}
        backButtonHref="/admin/blog"
      />
      <div className="mt-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          {error && <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</div>}
          {successMessage && <div className="p-4 mb-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</div>}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
            <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm bg-gray-100" 
            // readOnly // Typically slugs are not changed after creation for SEO. If you allow changes, remove readOnly.
            />
            <p className="text-xs text-gray-500 mt-1">Ensure this is unique. Changing slugs can affect SEO and existing links.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="published_at_date" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input type="date" name="published_at_date" id="published_at_date" value={formData.published_at_date} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
            <div>
                <label htmlFor="published_at_time" className="block text-sm font-medium text-gray-700 mb-1">Publish Time</label>
                <input type="time" name="published_at_time" id="published_at_time" value={formData.published_at_time} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="category" id="category" value={formData.category} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                    <option value="" disabled>Select a category</option>
                    {BLOG_POST_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input type="text" name="author_name" id="author_name" value={formData.author_name} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Featured Image (Replace Current)</label>
            {imagePreview && (
              <div className="mt-2 mb-2">
                <p className="text-xs text-gray-500 mb-1">Current/New Preview:</p>
                <Image src={imagePreview} alt="Article image preview" width={200} height={120} className="h-32 w-auto object-contain border rounded-md p-1 bg-gray-50"/>
              </div>
            )}
            <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/gif"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer" />
             <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one. Max 5MB.</p>
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea name="excerpt" id="excerpt" rows={3} value={formData.excerpt} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="A brief summary..."></textarea>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Main Content <span className="text-red-500">*</span></label>
            <TipTapEditor content={formData.content} onChange={handleContentChange} className="mt-1" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting || isLoadingData}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-60 transition-opacity">
              {isSubmitting ? 'Updating Article...' : 'Update Article'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditArticlePage;