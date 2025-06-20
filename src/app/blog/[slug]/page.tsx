// src/app/blog/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation'; // useParams to get slug, notFound for 404
import NextImage from 'next/image';
import Head from 'next/head';
import { BlogPost } from '@/types';
import PageHeader from '@/components/PageHeader'; // Optional: for a different style of header if needed
import Link from 'next/link';
import { CalendarDaysIcon, UserCircleIcon, TagIcon } from '@heroicons/react/24/outline';

const SingleArticlePage = () => {
  const params = useParams(); // Hook to get route parameters
  const slug = params?.slug as string | undefined; // slug can be string or string[]

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
              // Let Next.js handle the 404 page
              // In app router, you can call notFound() but it needs to be a server component or special function.
              // For client component, we'll set an error and handle display.
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
          console.error(`Error fetching article with slug "${slug}":`, err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchArticle();
    } else {
      // Handle case where slug is not available (should ideally not happen with proper routing)
      setError("Article slug not provided.");
      setIsLoading(false);
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Loading article...</p>
        {/* Spinner component could go here */}
      </div>
    );
  }

  if (error || !article) {
    // For client component, we render an error message.
    // To trigger Next.js 404 page from client, it's more complex.
    // This provides user feedback directly on this component.
    return (
      <>
        <PageHeader title="Article Not Found" subtitle={error || "The article you are looking for does not exist or is not available."} />
        <div className="container mx-auto px-4 py-10 text-center">
          <Link href="/blog" legacyBehavior>
            <a className="text-solar-flare-end hover:underline">← Back to all articles</a>
          </Link>
        </div>
      </>
    );
  }

  // If article is found:
  return (
    <>
      <Head>
        <title>{article.title} - Bills On Solar Blog</title>
        {article.excerpt && <meta name="description" content={article.excerpt} />}
        {/* Add other meta tags like Open Graph for sharing */}
        {article.image_url && <meta property="og:image" content={article.image_url} />}
      </Head>

      <article className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl"> {/* Max width for readability */}
          {/* Optional: Breadcrumbs or link back to blog */}
          <div className="mb-6 text-sm">
            <Link href="/blog" className="text-solar-flare-end hover:underline">
              ← Back to Blog
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-graphite mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information: Date, Author, Category */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8 space-x-4">
            {article.published_at && (
              <div className="flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                <span>{new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            {article.author_name && (
              <div className="flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                <span>By {article.author_name}</span>
              </div>
            )}
            {article.category && (
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                <span className="px-2 py-0.5 bg-gray-100 text-solar-flare-start rounded text-xs font-medium">{article.category.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {article.image_url && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
              <NextImage
                src={article.image_url}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                priority // Good to prioritize LCP image
              />
            </div>
          )}

          {/* Article Content */}
          {/* 
            IMPORTANT: If article.content contains HTML, using dangerouslySetInnerHTML is risky
            without proper sanitization. If it's Markdown, you'd use a Markdown renderer.
            For plain text or trusted simple HTML, this is okay.
          */}
          <div
            className="prose prose-lg max-w-none prose-img:rounded-xl prose-a:text-solar-flare-end hover:prose-a:text-solar-flare-start" // Tailwind Typography plugin for styling
            dangerouslySetInnerHTML={{ __html: article.content || '' }} 
          />
          {/* If content is plain text and you want to preserve line breaks:
          <div className="prose prose-lg max-w-none whitespace-pre-wrap">
            {article.content}
          </div>
          */}

          {/* Optional: Share buttons, related articles, comments section */}
          <div className="mt-12 border-t pt-8 text-center">
             <Link href="/blog" legacyBehavior>
                <a className="text-solar-flare-end hover:underline">← Back to all articles</a>
            </Link>
          </div>

        </div>
      </article>
    </>
  );
};

export default SingleArticlePage;