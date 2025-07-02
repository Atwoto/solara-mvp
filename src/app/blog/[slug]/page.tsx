// src/app/blog/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NextImage from 'next/image';
import Head from 'next/head';
import { BlogPost } from '@/types';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { CalendarDaysIcon, UserCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

// --- NEW: Reading Progress Bar Component ---
const ReadingProgressBar = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-solar-flare-start to-solar-flare-end origin-left z-50"
            style={{ scaleX }}
        />
    );
};

// --- REDESIGNED SINGLE ARTICLE PAGE ---
const SingleArticlePage = () => {
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const [article, setArticle] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            const fetchArticle = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch(`/api/blog?slug=${Array.isArray(slug) ? slug[0] : slug}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            setError('Article not found or not published.');
                        } else {
                            const errData = await response.json();
                            throw new Error(errData.message || 'Failed to fetch article');
                        }
                    } else {
                        const data: BlogPost = await response.json();
                        setArticle(data);
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchArticle();
        } else {
            setError("Article slug not provided.");
            setIsLoading(false);
        }
    }, [slug]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-gray-500 text-lg">Loading article...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <>
                <PageHeader title="Article Not Found" subtitle={error || "The article you are looking for does not exist or is not available."} />
                <div className="container mx-auto px-4 py-10 text-center">
                    <Link href="/blog" className="text-solar-flare-end hover:underline">
                        ← Back to all articles
                    </Link>
                </div>
            </>
        );
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = encodeURIComponent(article.title);

    return (
        <>
            <Head>
                <title>{article.title} - Bills On Solar Blog</title>
                {article.excerpt && <meta name="description" content={article.excerpt} />}
                {article.image_url && <meta property="og:image" content={article.image_url} />}
            </Head>

            <ReadingProgressBar />

            <article className="bg-white">
                {/* --- IMPRESSIVE NEW HERO HEADER --- */}
                <header className="relative h-[60vh] min-h-[400px] w-full">
                    <div className="absolute inset-0">
                        {article.image_url && (
                            <NextImage
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-4 pb-12 text-white">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                            {article.category && (
                                <Link href={`/blog?category=${article.category}`} className="text-sm font-bold uppercase tracking-wider text-solar-flare-start hover:underline">
                                    {article.category}
                                </Link>
                            )}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 leading-tight text-shadow-md">
                                {article.title}
                            </h1>
                            <div className="flex flex-wrap items-center text-sm text-gray-300 mt-4 gap-x-6 gap-y-2">
                                {article.author_name && (
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-5 w-5 mr-1.5" />
                                        <span>By {article.author_name}</span>
                                    </div>
                                )}
                                {article.published_at && (
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-5 w-5 mr-1.5" />
                                        <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* --- ARTICLE CONTENT --- */}
                <div className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="prose prose-lg max-w-none prose-img:rounded-xl prose-a:text-solar-flare-end hover:prose-a:text-solar-flare-start prose-blockquote:border-l-solar-flare-start prose-blockquote:text-gray-600 prose-blockquote:font-normal"
                            dangerouslySetInnerHTML={{ __html: article.content || '' }}
                        />

                        {/* --- SHARE & AUTHOR SECTION --- */}
                        <div className="mt-12 border-t pt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-sm text-gray-700">Share this article:</span>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"><FaFacebookF /></a>
                                    <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-black hover:text-white transition-colors"><FaTwitter /></a>
                                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-700 hover:text-white transition-colors"><FaLinkedinIn /></a>
                                </div>
                                <Link href="/blog" className="text-sm font-medium text-solar-flare-end hover:underline">
                                    ← Back to all articles
                                </Link>
                            </div>
                            {article.author_name && (
                                <div className="mt-10 flex items-center bg-gray-50 p-6 rounded-2xl border">
                                    <UserCircleIcon className="h-16 w-16 text-gray-300 mr-5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 font-semibold">About the Author</p>
                                        <h4 className="font-bold text-lg text-graphite">{article.author_name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">Our expert on solar technology and sustainable energy solutions, dedicated to bringing you the latest industry insights.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
};

export default SingleArticlePage;
