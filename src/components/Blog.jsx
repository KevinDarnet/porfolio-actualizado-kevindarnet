import React, { useState, useEffect } from 'react';
import { getAllPosts, getPostBySlug } from '../utils/posts';
import BlogFeed from './blog/BlogFeed';
import ArticleView from './blog/ArticleView';

export default function Blog() {
  const [posts] = useState(() => getAllPosts());
  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('blog/')) {
        return hash.replace('blog/', '');
      }
    }
    return null;
  });

  // Sincronizar el slug con el hash de la URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('blog/')) {
        const slug = hash.replace('blog/', '');
        setSelectedSlug(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'blog') {
        setSelectedSlug(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPost = (slug) => {
    setSelectedSlug(slug);
    if (window.history.pushState) {
      window.history.pushState(null, '', `#blog/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedSlug(null);
    if (window.history.pushState) {
      window.history.pushState(null, '', '#blog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePost = selectedSlug ? getPostBySlug(selectedSlug) : null;

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className={`${
        activePost
          ? 'pt-24 pb-16 w-full flex flex-col justify-start scroll-mt-24 border-b border-[#222222] lg:border-b-0'
          : 'pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {activePost ? (
          <ArticleView post={activePost} onBack={handleBackToFeed} />
        ) : (
          <BlogFeed posts={posts} onSelectPost={handleSelectPost} />
        )}
      </div>
    </section>
  );
}
