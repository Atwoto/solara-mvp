// src/app/admin/blog/edit/[articleId]/page.tsx
'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BlogPost, BLOG_POST_CATEGORIES, BlogPostCategory } from '@/types'; 
import Image from 'next/image';
import TipTapEditor from '@/components/admin/TipTapEditor';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/solid';

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

// --- IMPRESSIVE NEW "EDIT ARTICLE" PAGE ---
const EditArticlePage = () => {
    // All state and logic hooks remain the same
    const router = useRouter();
    const params = useParams();
    const articleId = params?.articleId as string | undefined;

    const { data: session, status: sessionStatus } = useSession();
    
    const [formData, setFormData] = useState<ArticleFormData | null>(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (sessionStatus === 'unauthenticated') {
            router.replace(`/login?callbackUrl=/admin/blog/edit/${articleId}`);
        } else if (sessionStatus === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
            router.replace('/');
        }
    }, [session, sessionStatus, router, articleId]);

    useEffect(() => {
        if (!articleId || sessionStatus !== 'authenticated') return;

        const fetchArticleData = async () => {
            setIsLoadingData(true);
            setError(null);
            try {
                const response = await fetch(`/api/admin/blog/${articleId}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error('Article not found.');
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to fetch article data');
                }
                const article: BlogPost = await response.json();

                let pDate = '';
                let pTime = '00:00';
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
                    content: article.content || '<p></p>',
                    author_name: article.author_name || '',
                    published_at_date: pDate,
                    published_at_time: pTime,
                    imageFile: null, 
                    currentImageUrl: article.image_url || null,
                });
                if(article.image_url) setImagePreview(article.image_url);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchArticleData();
    }, [articleId, sessionStatus]);

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
        if (!formData || !articleId) { setError("Form data or Article ID is missing."); return; }
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
        dataToSubmit.append('author_name', formData.author_name.trim());
        
        if (formData.published_at_date) {
            const dateTimeString = `${formData.published_at_date}T${formData.published_at_time || '00:00:00'}`;
            dataToSubmit.append('published_at', new Date(dateTimeString).toISOString());
        } else {
            dataToSubmit.append('published_at', ''); 
        }

        if (formData.imageFile) { dataToSubmit.append('imageFile', formData.imageFile); }
        if (formData.currentImageUrl) { dataToSubmit.append('currentImageUrl', formData.currentImageUrl); }

        try {
            const response = await fetch(`/api/admin/blog/${articleId}`, { method: 'PUT', body: dataToSubmit });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update article');
            setSuccessMessage(result.message || 'Article updated successfully!');
            if (result.article?.image_url) {
                setFormData(prev => prev ? { ...prev, currentImageUrl: result.article.image_url, imageFile: null } : null);
                setImagePreview(result.article.image_url);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
  
    if (isLoadingData || sessionStatus === 'loading') {
        return <div className="p-6"><PageLoader message="Loading article data..." /></div>;
    }
    if (sessionStatus !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
        return <div className="p-6"><PageLoader message="Access Denied. Redirecting..." /></div>; 
    }
    if (!formData) {
        return (
            <div className="p-6 text-center">
                <PageHeader title="Error" description={error || "Article could not be loaded."} showBackButton={true} backButtonHref="/admin/blog" />
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Edit Article"
                description={`Now editing: "${formData.title}"`}
                showBackButton={true}
                backButtonHref="/admin/blog"
            />
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className="block w-full text-2xl font-bold p-2 border-x-0 border-t-0 border-b-2 border-slate-200 focus:ring-0 focus:border-solar-flare-start transition-colors" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                             <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">Main Content <span className="text-red-500">*</span></label>
                            <TipTapEditor content={formData.content} onChange={handleContentChange} />
                        </motion.div>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-1">Excerpt (Optional)</label>
                            <textarea name="excerpt" id="excerpt" rows={3} value={formData.excerpt} onChange={handleInputChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="A brief summary for listings and SEO..."></textarea>
                        </motion.div>
                    </div>

                    {/* Sidebar Column */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1 space-y-6 lg:sticky top-28">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200/80">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Publishing Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                                    <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm bg-slate-50" />
                                    <p className="text-xs text-slate-500 mt-1">Changing slugs can break existing links.</p>
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
                             <label htmlFor="imageFile" className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-solar-flare-start transition-colors w-full h-48 flex flex-col items-center justify-center text-center p-4">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Selected image preview" layout="fill" className="object-contain p-2" />
                                ) : (
                                    <div className="text-slate-500">
                                        <PhotoIcon className="mx-auto h-12 w-12" />
                                        <span className="mt-2 block text-sm font-semibold">No image set</span>
                                    </div>
                                )}
                                <input id="imageFile" name="imageFile" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                            <p className="text-xs text-slate-500 mt-2 text-center">Click above to upload a new image and replace the current one.</p>
                         </div>
                    </motion.div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="sticky bottom-0 left-0 right-0 py-4 bg-white/70 backdrop-blur-lg border-t border-slate-200 mt-8">
                     <div className="container mx-auto px-4">
                        <div className="flex justify-end max-w-5xl mx-auto">
                            <div className="flex-1 mr-4">
                                <AnimatePresence>
                                    {error && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</motion.div>}
                                    {successMessage && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</motion.div>}
                                </AnimatePresence>
                            </div>
                            <button type="submit" disabled={isSubmitting || isLoadingData} className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-50 transition-opacity">
                                {isSubmitting ? <><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Updating...</> : 'Update Article'}
                            </button>
                        </div>
                     </div>
                </div>
            </form>
        </>
    );
};

export default EditArticlePage;
