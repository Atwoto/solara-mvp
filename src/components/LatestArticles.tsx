// src/components/LatestArticles.tsx
'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const LatestArticles = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/blog?limit=3'); 
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch articles');
        }
        const data: BlogPost[] = await response.json();
        // console.log('Latest Articles Data:', JSON.stringify(data, null, 2)); // For debugging
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching latest articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  const renderSectionHeader = () => (
    <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
      <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
        OUR BLOG
      </p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite">
        Latest Articles Updated Weekly
      </h2>
      <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
        Stay informed with our latest insights, news, and tips on solar energy and sustainable living.
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          {renderSectionHeader()}
          <p className="text-center text-gray-500">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          {renderSectionHeader()}
          <p className="text-center text-red-500 bg-red-50 p-4 rounded-md">Could not load articles: {error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          {renderSectionHeader()}
          <p className="text-center text-gray-500">No articles available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        {renderSectionHeader()}
        <div className="mx-auto mt-12 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
          {posts.map((post, index) => ( 
            <article key={post.id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5">
              <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                {/* The <a> tag is now the direct positioned parent with defined height */}
                <a className="block relative w-full h-52 sm:h-56 md:h-60 overflow-hidden bg-gray-200 group">
                  {post.image_url ? (
                    <NextImage
                      src={post.image_url}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
                      priority={index < 2} 
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center text-gray-400 text-sm">
                      No Image Available
                    </div>
                  )}
                </a>
              </Link>
              <div className="flex flex-1 flex-col justify-between bg-white p-5 sm:p-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    {post.published_at && (
                        <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400"/>
                            <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </time>
                        </div>
                    )}
                    {post.category && (
                        <span className="inline-flex items-center rounded-full bg-solar-flare-start/10 px-2.5 py-0.5 font-medium text-xs text-solar-flare-end">
                        {post.category}
                        </span>
                    )}
                  </div>
                  <Link href={`/blog/${post.slug}`} className="mt-1 block group/title">
                    <h3 className="text-lg sm:text-xl font-semibold text-graphite group-hover/title:text-solar-flare-start transition-colors line-clamp-2" style={{ minHeight: '3em' }}>
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3" style={{ minHeight: '4.5em' }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-medium text-solar-flare-end hover:text-solar-flare-start group transition-colors">
                    Read More
                    <ArrowRightIcon className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
            <Link href="/blog" legacyBehavior>
                <a className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:ring-opacity-50 active:scale-95">
                    View All Articles
                </a>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestArticles;