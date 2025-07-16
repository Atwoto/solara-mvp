// src/app/admin/blog/new/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BLOG_POST_CATEGORIES, BlogPostCategory } from '@/types';
import Image from 'next/image';
import TipTapEditor from '@/components/admin/TipTapEditor';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/solid';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

// Define the structure of our form data
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
  // --- NEW: Add key_takeaways to the form data type ---
  key_takeaways: string;
};

// Define the initial state for a new form
const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '<h2>Start with a great headline...</h2><p>Then, write your amazing article here! You can use <strong>bold</strong>, <em>italics</em>, and more.</p>',
  author_name: '',
  published_at_date: '',
  published_at_time: '09:00',
  imageFile: null,
  // --- NEW: Initialize key_takeaways as an empty JSON array string ---
  key_takeaways: '[]',
};

const AddNewArticlePage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // Effect to handle authentication and authorization
    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace(`/login?callbackUrl=/admin/blog/new`);
        } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
            router.replace('/');
        }
    }, [session, status, router]);

    // Helper to convert a title string to a URL-friendly slug
    const titleToSlug = (titleString: string) => {
        return titleString
            .toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    };

    // Generic handler for most form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'slug') {
            setIsSlugManuallyEdited(true);
        }
    };
    
    // Effect to auto-generate slug from title, if not manually edited
    useEffect(() => {
        if (!isSlugManuallyEdited) {
            setFormData(prev => ({ ...prev, slug: titleToSlug(prev.title) }));
        }
    }, [formData.title, isSlugManuallyEdited]);

    // Specific handler for the rich text editor
    const handleContentChange = (richText: string) => {
        setFormData(prev => ({ ...prev, content: richText }));
    };

    // Handler for the featured image file input
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.');
                e.target.value = ''; return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File is too large. Maximum size is 5MB.');
                e.target.value = ''; return;
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

    // Main submission handler
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
        dataToSubmit.append('author_name', formData.author_name.trim() || (session?.user?.name || 'Admin'));
        
        // --- NEW: Append the key_takeaways JSON string to the form data ---
        dataToSubmit.append('key_takeaways', formData.key_takeaways);

        if (formData.published_at_date) {
            const dateTimeString = `${formData.published_at_date}T${formData.published_at_time || '00:00:00'}`;
            const localDate = new Date(dateTimeString);
            if (!isNaN(localDate.getTime())) {
                dataToSubmit.append('published_at', localDate.toISOString());
            }
        }

        if (formData.imageFile) { dataToSubmit.append('imageFile', formData.imageFile); }

        try {
            const response = await fetch('/api/admin/blog', { method: 'POST', body: dataToSubmit });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.message || 'Failed to add article'); }
            setSuccessMessage(result.message || 'Article added successfully! Redirecting...');
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
        <>
            <PageHeader
                title="Add New Article"
                description="Craft your new blog post here."
                showBackButton={true}
                backButtonHref="/admin/blog"
            />
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className="block w-full text-2xl font-bold p-2 border-x-0 border-t-0 border-b-2 border-slate-200 focus:ring-0 focus:border-solar-flare-start transition-colors" placeholder="Your Awesome Article Title" />
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                             <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">Main Content <span className="text-red-500">*</span></label>
                            <TipTapEditor content={formData.content} onChange={handleContentChange} />
                        </div>
                         <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-1">Excerpt (Optional)</label>
                            <textarea name="excerpt" id="excerpt" rows={3} value={formData.excerpt} onChange={handleInputChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="A brief summary for listings and SEO..."></textarea>
                        </div>
                        {/* --- NEW: Key Takeaways Input Section --- */}
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <label htmlFor="key_takeaways" className="block text-sm font-medium text-slate-700 mb-1">Key Takeaways (Optional, JSON format)</label>
                            <textarea
                                name="key_takeaways"
                                id="key_takeaways"
                                rows={5}
                                value={formData.key_takeaways}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm font-mono"
                                placeholder='e.g., ["First key point", "Second key point"]'
                            />
                            <p className="mt-1 text-xs text-slate-500">Enter a valid JSON array of strings or objects like {"{ \"title\": \"Topic\", \"detail\": \"Explanation\" }"}.</p>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky top-28">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Publishing Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                                    <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="published_at_date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                        <input type="date" name="published_at_date" id="published_at_date" value={formData.published_at_date} onChange={handleInputChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="published_at_time" className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                        <input type="time" name="published_at_time" id="published_at_time" value={formData.published_at_time} onChange={handleInputChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">Leave date blank to save as a draft.</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                             <h3 className="text-lg font-semibold text-slate-800 mb-4">Organization</h3>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                    <select name="category" id="category" value={formData.category} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm">
                                        <option value="" disabled>Select a category</option>
                                        {BLOG_POST_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="author_name" className="block text-sm font-medium text-slate-700 mb-1">Author Name</label>
                                    <input type="text" name="author_name" id="author_name" value={formData.author_name} onChange={handleInputChange} placeholder={session?.user?.name || "Admin"} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                                </div>
                             </div>
                        </div>
                         <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                             <h3 className="text-lg font-semibold text-slate-800 mb-4">Featured Image</h3>
                             <label htmlFor="imageFile" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full h-48 flex items-center justify-center text-center p-4">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Selected image preview" layout="fill" className="object-contain" />
                                ) : (
                                    <div className="text-slate-500">
                                        <PhotoIcon className="mx-auto h-12 w-12" />
                                        <span className="mt-2 block text-sm font-semibold">Click to upload an image</span>
                                        <span className="block text-xs">PNG, JPG, GIF up to 5MB</span>
                                    </div>
                                )}
                                <input id="imageFile" name="imageFile" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                         </div>
                    </div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8">
                     <div className="max-w-3xl mx-auto px-6">
                        <AnimatePresence>
                            {error && <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</motion.div>}
                            {successMessage && <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="p-3 mb-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</motion.div>}
                        </AnimatePresence>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-50 transition-opacity">
                                {isSubmitting ? <><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Saving...</> : 'Save Article'}
                            </button>
                        </div>
                     </div>
                </div>
            </form>
        </>
    );
};

export default AddNewArticlePage;
