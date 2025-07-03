// src/app/admin/blog/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
// --- THE FIX: Added NewspaperIcon to the import list ---
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, CalendarDaysIcon, TagIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const ADMIN_EMAIL = 'kenbillsonsolararea@gmail.com';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

// --- IMPRESSIVE NEW ARTICLE LIST ITEM ---
const ArticleListItem = ({ article, onDelete }: { article: BlogPost, onDelete: () => void }) => {
    const isPublished = article.published_at && new Date(article.published_at) <= new Date();
    const publishedDateString = article.published_at 
        ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
        : 'Not Set';

    const statusConfig = isPublished
        ? { text: 'Published', color: 'bg-green-500' }
        : article.published_at
        ? { text: 'Scheduled', color: 'bg-yellow-500' }
        : { text: 'Draft', color: 'bg-slate-400' };

    return (
        <motion.div layout variants={itemVariants} exit="exit" className="bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow duration-300">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                    <Link href={`/admin/blog/edit/${article.id}`} className="group">
                        <h3 className="text-md font-semibold text-slate-800 truncate group-hover:text-solar-flare-end transition-colors" title={article.title}>
                            {article.title}
                        </h3>
                    </Link>
                    <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`}></div>
                            {statusConfig.text}
                        </div>
                        {article.category && (
                            <div className="flex items-center gap-1.5">
                                <TagIcon className="h-4 w-4" />
                                {article.category}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <CalendarDaysIcon className="h-4 w-4" />
                            Published: {publishedDateString}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-2 mt-4 sm:mt-0 sm:ml-4">
                    <Link href={`/blog/${article.slug}`} target="_blank" className="p-2 rounded-lg text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-colors" title="View Live Article">
                        <EyeIcon className="h-5 w-5"/>
                    </Link>
                    <Link href={`/admin/blog/edit/${article.id}`} className="p-2 rounded-lg text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors" title="Edit Article">
                        <PencilSquareIcon className="h-5 w-5"/>
                    </Link>
                    <button onClick={onDelete} className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete Article">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};


const AdminBlogPage = () => {
    // All state and logic hooks remain the same
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
        } finally {
            setIsLoading(false);
        }
    }, []); 

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
            fetchArticles();
        }
    }, [status, session, fetchArticles]); 

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
            const response = await fetch(`/api/admin/blog/${articleId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete article');
            alert(result.message || 'Article deleted successfully!');
            setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
        } catch (err: any) {
            alert(`Error deleting article: ${err.message}`);
        }
    };

    if (status === 'loading' || (isLoading && articles.length === 0)) {
        return <div className="p-6"><PageLoader message="Loading articles..." /></div>;
    }
    if (status !== 'authenticated' || session?.user?.email !== ADMIN_EMAIL) {
        return <div className="p-6"><PageLoader message="Redirecting..." /></div>; 
    }

    return (
        <>
            <PageHeader
                title="Manage Articles"
                description="Create, edit, and manage your blog posts."
            >
                <Link href="/admin/blog/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Article
                </Link>
            </PageHeader>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm" role="alert">{error}</div>}
            
            {!isLoading && articles.length === 0 && !error && (
                <div className="text-center py-16 bg-white rounded-xl border-dashed border-2 border-slate-200">
                    <NewspaperIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No Articles Found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating your first blog post.</p>
                    <div className="mt-6">
                        <Link href="/admin/blog/new" className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 inline-flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Write your first article
                        </Link>
                    </div>
                </div>
            )}

            {articles.length > 0 && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    <AnimatePresence>
                        {articles.map((article) => (
                           <ArticleListItem 
                                key={article.id} 
                                article={article} 
                                onDelete={() => handleDeleteArticle(article.id, article.title)}
                           />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </>
    );
};

export default AdminBlogPage;
