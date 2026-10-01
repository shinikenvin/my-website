import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BlogArtwork } from './Artwork';
import { Search, Clock, ArrowRight, Heart, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface BlogSectionProps {
  onSelectPost: (post: BlogPost) => void;
}

export function BlogSection({ onSelectPost }: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { t } = useLanguage();
  const { blogPosts } = usePortfolioData();

  const categories = [
    { id: 'all', label: t.blog.badge },
    { id: 'DevOps & CI/CD', label: 'DevOps & CI/CD' },
    { id: 'Frontend & UI', label: 'Frontend & UI' },
    { id: 'Kiến trúc & Design', label: 'Kiến trúc / Architecture' },
    { id: 'Hiệu năng & Tối ưu', label: 'Performance' },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="blog" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan-400">
              02. {t.blog.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.blog.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {t.blog.subtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search / Tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 mb-8 overflow-x-auto">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Blog Post Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectPost(post)}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-cyan-950/20"
              >
                {/* Visual Header */}
                <BlogArtwork category={post.category} />

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    
                    {/* Zero-Pill Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-cyan-400 font-medium">{post.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{post.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">⏱ {post.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {post.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {/* Card Bottom: Likes and Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-mono tabular-nums">{post.likes}</span>
                    </div>

                    <div className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                      <span>{t.blog.readMore}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Không tìm thấy bài viết phù hợp với từ khóa "{searchQuery}".</p>
          </div>
        )}

      </div>
    </section>
  );
}
