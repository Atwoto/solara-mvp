// src/app/blog/page.tsx
'use client'; // This page will fetch data client-side

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image'; // Renamed to avoid conflict if Image is used as a component name
import Head from 'next/head';
import { BlogPost } from '@/types'; // Your BlogPost type
import PageHeader from '@/components/PageHeader'; // Assuming you have a generic PageHeader

// You can reuse the ProductCatalog's card styling or create a dedicated ArticleCard component
// For now, we'll adapt some styling directly here.

const AllArticlesPage = () => {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/blog'); // No limit, fetches all published
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch articles');
        }
        const data: BlogPost[] = await response.json();
        setArticles(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching all articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllArticles();
  }, []);

  return (
    <>
      <Head>
        <title>Our Blog - Bills On Solar EA Limited</title>
        <meta name="description" content="Read the latest articles, news, and insights on solar energy, products, and industry trends from Bills On Solar." />
      </Head>

      <PageHeader
        title="Our Blog"
        subtitle="Latest articles, news, and insights on solar energy solutions."
      />

      <div className="container mx-auto px-4 py-12 sm:py-16">
        {isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">Loading articles...</p>
            {/* You can add a spinner here */}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 bg-red-100 p-4 rounded-md">Error loading articles: {error}</p>
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No articles published yet. Check back soon!</p>
          </div>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((post) => (
              <div key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group bg-white">
                <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                  <a className="block">
                    <div className="relative h-56 w-full bg-gray-200">
                      {post.image_url ? ( // Use image_url as per your types.ts
                        <NextImage
                          src={post.image_url}
                          alt={post.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">No Image Available</div>
                      )}
                      {post.category && (
                          <div className="absolute top-3 right-3 bg-solar-flare-start px-2.5 py-1 text-xs font-semibold text-white rounded-md shadow">
                          {post.category.toUpperCase()}
                          </div>
                      )}
                    </div>
                  </a>
                </Link>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {/* Ensure published_at exists before trying to format */}
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Date not set')}
                    </p>
                    <Link href={`/blog/${post.slug}`} className="mt-2 block">
                      <h3 className="text-xl font-semibold text-graphite hover:text-solar-flare-start transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-6">
                    <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-solar-flare-end hover:text-solar-flare-start transition-colors">
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* TODO: Add Pagination controls here if you have many articles */}
        {/* For example:
        {!isLoading && !error && articles.length > ITEMS_PER_PAGE && (
            <div className="mt-12 flex justify-center">
                <button className="px-4 py-2 mx-1 border rounded">Previous</button>
                <button className="px-4 py-2 mx-1 border rounded">Next</button>
            </div>
        )}
        */}
      </div>
    </>
  );
};

export default AllArticlesPage;