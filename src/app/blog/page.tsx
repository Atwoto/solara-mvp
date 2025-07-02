// src/app/blog/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import Head from 'next/head';
import { BlogPost, BlogPostCategory } from '@/types';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' } },
};

// --- IMPRESSIVE NEW ARTICLE CARD COMPONENT ---
const ArticleCard = ({ post }: { post: BlogPost }) => (
    <motion.div
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1"
    >
        <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative w-full h-56 bg-gray-200">
                {post.image_url ? (
                    <NextImage
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
                )}
                 {post.category && (
                    <div className="absolute top-3 right-3 bg-solar-flare-start/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-deep-night rounded-full shadow">
                        {post.category}
                    </div>
                )}
            </div>
        </Link>
        <div className="flex flex-1 flex-col justify-between p-5">
            <div className="flex-1">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    <time dateTime={post.published_at || post.created_at}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not set'}
                    </time>
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-2 block">
                    <h3 className="text-lg font-semibold text-graphite group-hover:text-solar-flare-end transition-colors line-clamp-2">{post.title}</h3>
                </Link>
                {post.excerpt && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                )}
            </div>
            <div className="mt-6">
                <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-solar-flare-end hover:text-solar-flare-start transition-colors flex items-center group/link">
                    Read More
                    <ArrowRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
            </div>
        </div>
    </motion.div>
);

// --- REDESIGNED BLOG PAGE ---
const AllArticlesPage = () => {
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchAllArticles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/blog');
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
        };
        fetchAllArticles();
    }, []);

    const categories = useMemo(() => {
        const allCats = articles
            .map(post => post.category)
            .filter((cat): cat is BlogPostCategory => cat !== null && cat !== undefined);
        return ['All', ...Array.from(new Set(allCats))];
    }, [articles]);

    const filteredArticles = activeCategory === 'All'
        ? articles
        : articles.filter(post => post.category === activeCategory);

    return (
        <>
            <Head>
                <title>Our Blog - Bills On Solar EA Limited</title>
                <meta name="description" content="Read the latest articles, news, and insights on solar energy, products, and industry trends from Bills On Solar." />
            </Head>

            <PageHeader
                title="Our Blog & Insights"
                subtitle="Stay informed with our latest articles, industry news, and expert tips on renewable energy."
            />

            <div className="bg-gray-50/70 py-16 sm:py-20">
                <div className="container mx-auto px-4">
                    {/* Impressive new Filter Bar */}
                    <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mb-12">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`relative px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-start ${
                                    activeCategory === category ? 'text-white' : 'text-gray-600 hover:text-deep-night bg-white shadow-sm hover:bg-gray-100'
                                }`}
                            >
                                {activeCategory === category && (
                                    <motion.div
                                        layoutId="active-blog-category-highlight"
                                        className="absolute inset-0 bg-deep-night rounded-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <span className="relative z-10">{category}</span>
                            </button>
                        ))}
                    </div>

                    {isLoading && <div className="text-center py-10 text-gray-500">Loading articles...</div>}
                    {error && <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</div>}

                    {!isLoading && !error && (
                        <motion.div
                            layout
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence>
                                {filteredArticles.length > 0 ? (
                                    filteredArticles.map((post) => (
                                        <ArticleCard key={post.id} post={post} />
                                    ))
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-10 text-gray-500">
                                        No articles found in this category.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AllArticlesPage;
