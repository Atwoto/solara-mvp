'use client';

import { useState, useEffect } from 'react';
// import NextImage from 'next/image'; // No longer needed
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BlogPost } from '@/types';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// --- ARTICLE CARD COMPONENTS ---
const FeaturedArticleCard = ({ post }: { post: BlogPost }) => (
    <motion.article
        variants={itemVariants}
        className="group relative lg:col-span-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
    >
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={`Read more about ${post.title}`}></Link>
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gray-200">
            {post.image_url && (
                // --- THIS IS THE FIX ---
                <img
                    src={post.image_url}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager" // Eager load the main featured image
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20 text-white">
            <div className="flex items-center space-x-3 text-xs opacity-90 mb-2">
                {post.published_at && (
                    <>
                        <CalendarDaysIcon className="h-4 w-4" />
                        <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </>
                )}
                {post.category && <span className="inline-block bg-solar-flare-end/80 px-2 py-0.5 rounded-full text-white font-medium">{post.category}</span>}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-shadow-md transition-colors group-hover:text-solar-flare-start">{post.title}</h3>
            <p className="mt-2 text-sm text-gray-200 line-clamp-2 text-shadow-sm">{post.excerpt}</p>
        </div>
    </motion.article>
);

const SecondaryArticleCard = ({ post }: { post: BlogPost }) => (
    <motion.article
        variants={itemVariants}
        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
    >
        <div className="relative w-full h-48 bg-gray-200">
            <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={`Read more about ${post.title}`}></Link>
            {post.image_url ? (
                // --- THIS IS THE FIX ---
                <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
            )}
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
            <div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    {post.published_at && (
                        <>
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
                            {post.category && <span>·</span>}
                        </>
                    )}
                    {post.category && <span className="font-medium text-solar-flare-end">{post.category}</span>}
                </div>
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-graphite group-hover:text-solar-flare-end transition-colors line-clamp-2">{post.title}</h3>
                </Link>
            </div>
            <div className="mt-4">
                 <Link href={`/blog/${post.slug}`} className="font-semibold text-sm text-solar-flare-start flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Read More <ArrowRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                 </Link>
            </div>
        </div>
    </motion.article>
);


// --- LATEST ARTICLES SECTION ---
const LatestArticles = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestArticles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/blog?limit=3');
                if (!response.ok) throw new Error('Failed to fetch articles');
                setPosts(await response.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLatestArticles();
    }, []);

    const featuredPost = posts[0];
    const secondaryPosts = posts.slice(1, 3);

    const renderHeader = () => (
        <motion.div variants={itemVariants} className="mx-auto max-w-3xl text-center mb-16">
            <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">OUR INSIGHTS</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite">
                Latest News from Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end">Solar Hub</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">Stay informed with our latest insights, industry news, and expert tips on renewable energy.</p>
        </motion.div>
    );

    if (isLoading || error || posts.length === 0) {
        return (
            <div className="bg-cloud-white py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    {renderHeader()}
                    <div className="text-center text-gray-500">
                        {isLoading ? 'Loading latest articles...' : 'No articles available yet. Check back soon!'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-cloud-white py-20 sm:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/patterns/subtle-grid.svg')] opacity-40"></div>
            <div className="relative container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {renderHeader()}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {featuredPost && <FeaturedArticleCard post={featuredPost} />}
                        
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {secondaryPosts.map((post) => (
                                <SecondaryArticleCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>

                    <motion.div variants={itemVariants} className="mt-16 text-center">
                        <Link href="/blog" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-deep-night transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-flare-end active:scale-95">
                            View All Articles
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default LatestArticles;
