// src/app/admin/blog/new/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// REMOVE: import AdminLayout from '@/components/admin/AdminLayout'; // No longer needed here
import { BLOG_POST_CATEGORIES, BlogPostCategory } from '@/types'; 
import Image from 'next/image';
import TipTapEditor from '@/components/admin/TipTapEditor'; 
import PageHeader from '@/components/admin/PageHeader'; // For consistent page titles
import PageLoader from '@/components/PageLoader';     // For consistent loading states

const ADMIN_EMAIL = 'ndekeharrison8@gmail.com'; 

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
};

const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  category: '', 
  excerpt: '',
  content: '<p>Start writing your amazing article here!</p>', 
  author_name: '', 
  published_at_date: '', 
  published_at_time: '00:00', // Default time
  imageFile: null,
};

const AddNewArticlePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Security Guard
  useEffect(() => {
    if (status === 'loading') return; 
    if (status === 'unauthenticated') {
        router.replace(`/login?callbackUrl=/admin/blog/new`);
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
        router.replace('/'); 
    }
  }, [session, status, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
        const currentSlugWasAuto = !formData.slug || formData.slug === titleToSlug(formData.title.substring(0, formData.slug.length + 5)); // Heuristic
        if (currentSlugWasAuto) {
            setFormData(prev => ({ ...prev, slug: titleToSlug(prev.title) }));
        }
    }
  }, [formData.title]); // Only re-run when title changes

  const titleToSlug = (titleString: string) => {
    return titleString
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') 
        .replace(/[^\w-]+/g, '') 
        .replace(/--+/g, '-'); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
        setFormData(prev => ({
            ...prev,
            title: value,
            // Slug will be updated by the useEffect a.slug: titleToSlug(value)
        }));
    } else if (name === 'slug') {
        setFormData(prev => ({...prev, slug: titleToSlug(value)})); // Ensure slug is also sanitized if manually changed
    }
    else {
        setFormData(prev => ({
        ...prev,
        [name]: value,
        }));
    }
  };

  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, content: richText }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
          setError('Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.');
          e.target.value = ''; 
          return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
          setError('File is too large. Maximum size is 5MB.');
          e.target.value = ''; 
          return;
      }
      setError(null); 

      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageFile: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim() || formData.content === '<p></p>') {
        setError("Title, Slug, and Content are required."); return;
    }
    if (!formData.category) { setError("Please select a category."); return; }

    setIsSubmitting(true); setError(null); setSuccessMessage(null);

    const dataToSubmit = new FormData(); 
    dataToSubmit.append('title', formData.title.trim());
    dataToSubmit.append('slug', formData.slug.trim());
    dataToSubmit.append('category', formData.category);
    dataToSubmit.append('excerpt', formData.excerpt.trim());
    dataToSubmit.append('content', formData.content);
    dataToSubmit.append('author_name', formData.author_name.trim() || (session?.user?.name || session?.user?.email || 'Admin')); // Default author
    
    if (formData.published_at_date) {
        const dateTimeString = `${formData.published_at_date}T${formData.published_at_time || '00:00:00'}`;
        // Ensure time is also considered for UTC conversion, default to midnight if only date is set
        const localDate = new Date(dateTimeString);
        if (!isNaN(localDate.getTime())) { // Check if date is valid
            dataToSubmit.append('published_at', localDate.toISOString());
        } else {
            console.warn("Invalid date/time string constructed:", dateTimeString);
            // Decide if you want to submit null or show an error
            // For now, not appending if invalid
        }
    }

    if (formData.imageFile) { dataToSubmit.append('imageFile', formData.imageFile); }

    try {
      const response = await fetch('/api/admin/blog', { method: 'POST', body: dataToSubmit });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.message || 'Failed to add article'); }
      setSuccessMessage(result.message || 'Article added successfully! Redirecting...');
      setFormData(initialFormData); 
      setImagePreview(null);
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setTimeout(() => { router.push('/admin/blog'); }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (status === 'loading') {
    return <div className="p-6"><PageLoader message="Loading page..." /></div>;
  }
  if (status !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
  }

  return (
    // The <AdminLayout> wrapper is applied by src/app/admin/layout.tsx
    <>
      <PageHeader
        title="Add New Article"
        description="Craft your new blog post here."
        showBackButton={true}
        backButtonHref="/admin/blog"
      />
      <div className="mt-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          {error && <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</div>}
          {successMessage && <div className="p-4 mb-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</div>}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
            <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm bg-gray-50" 
                    placeholder="auto-generated-from-title" />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from title. Ensure it's unique and URL-friendly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="published_at_date" className="block text-sm font-medium text-gray-700 mb-1">Publish Date (Optional)</label>
                <input type="date" name="published_at_date" id="published_at_date" value={formData.published_at_date} onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
            <div>
                <label htmlFor="published_at_time" className="block text-sm font-medium text-gray-700 mb-1">Publish Time (Optional)</label>
                <input type="time" name="published_at_time" id="published_at_time" value={formData.published_at_time} onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="category" id="category" value={formData.category} onChange={handleInputChange} required
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                <option value="" disabled>Select a category</option>
                {BLOG_POST_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input type="text" name="author_name" id="author_name" value={formData.author_name} onChange={handleInputChange}
                        placeholder={session?.user?.name || session?.user?.email || "Admin"}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Featured Image (Optional)</label>
            <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/gif"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer" />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                <Image src={imagePreview} alt="Selected image preview" width={200} height={120} className="h-32 w-auto object-contain border rounded-md p-1 bg-gray-50"/>
              </div>
            )}
             <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Recommended: 1200x630px for social sharing.</p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Optional)</label>
            <textarea name="excerpt" id="excerpt" rows={3} value={formData.excerpt} onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="A brief summary for listings and SEO... Max 160 characters recommended."></textarea>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Main Content <span className="text-red-500">*</span></label>
            <TipTapEditor
              content={formData.content}
              onChange={handleContentChange}
              className="mt-1"
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-60 transition-opacity">
              {isSubmitting ? 'Saving Article...' : 'Save Article'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddNewArticlePage;