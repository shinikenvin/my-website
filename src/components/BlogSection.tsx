import React, { useState, useMemo, useEffect } from 'react';
import { BlogPost } from '../types';
import { BlogArtwork } from './Artwork';
import { 
  Search, Clock, ArrowRight, Heart, BookOpen, Plus, Edit3, Trash2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAuth } from '../context/AuthContext';
import { BlogEditModal } from './BlogEditModal';

interface BlogSectionProps {
  onSelectPost: (post: BlogPost) => void;
  onOpenAdminBlog?: (blogId?: string) => void;
}

export function BlogSection({ onSelectPost, onOpenAdminBlog }: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination & "Xem thêm" settings (synced to 3 items per page)
  const POSTS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const { t } = useLanguage();
  const { blogPosts, deleteBlogPost } = usePortfolioData();
  const { isAdmin } = useAuth();

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Dynamic categories including defaults + any custom category added by admin
  const categories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: t.blog.badge },
      { id: 'DevOps & CI/CD', label: 'DevOps & CI/CD' },
      { id: 'Frontend & UI', label: 'Frontend & UI' },
      { id: 'Kiến trúc & Design', label: 'Kiến trúc / Architecture' },
      { id: 'Hiệu năng & Tối ưu', label: 'Performance' },
    ];
    const catMap = new Map<string, string>();
    defaultCats.forEach((c) => catMap.set(c.id, c.label));

    blogPosts.forEach((post) => {
      if (post.category?.trim() && !catMap.has(post.category.trim())) {
        catMap.set(post.category.trim(), post.category.trim());
      }
    });

    const list: { id: string; label: string }[] = [];
    catMap.forEach((label, id) => list.push({ id, label }));
    return list;
  }, [blogPosts, t.blog.badge]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // Paginated or expanded posts list
  const displayedPosts = useMemo(() => {
    if (showAll || filteredPosts.length <= POSTS_PER_PAGE) {
      return filteredPosts;
    }
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, showAll, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShowAll(false);
    const el = document.getElementById('blog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="blog" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-cyan-400">
                02. {t.blog.badge}
              </div>
              {isAdmin && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold">
                  Chế độ Quản trị (Admin)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.blog.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {t.blog.subtitle}
            </p>
          </div>

          {/* Action Area: Admin Button + Search Box */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                title="Thêm một bài viết blog mới vào hệ thống"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm Bài Viết Mới</span>
              </button>
            )}

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
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedPosts.map((post) => (
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
                <div className="cursor-pointer overflow-hidden group-hover:opacity-95 transition-opacity relative h-48 bg-slate-950">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BlogArtwork category={post.category} />
                  )}
                  {post.videoUrl && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 flex items-center gap-1 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Video</span>
                    </div>
                  )}
                </div>

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

                  {/* Admin Inline Controls: Sửa & Xóa (Chỉnh sửa ngay trên giao diện) */}
                  {isAdmin && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-end gap-4 text-xs font-medium"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingBlog(post)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                        title="Chỉnh sửa bài viết này trực tiếp ngoài giao diện"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostToDelete(post)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                        title="Xóa bài viết này khỏi hệ thống"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}

                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination & "Xem thêm" Controller for Blog */}
        {filteredPosts.length > POSTS_PER_PAGE && (
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Counter */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                {showAll
                  ? `Đang hiển thị toàn bộ ${filteredPosts.length} bài viết`
                  : `Hiển thị ${(currentPage - 1) * POSTS_PER_PAGE + 1} - ${Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} trên tổng số ${filteredPosts.length} bài viết (Trang ${currentPage}/${totalPages})`}
              </span>
            </div>

            {/* Pagination Controls & Expand Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {!showAll ? (
                <>
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isActive = currentPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/50 scale-105'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="Trang sau"
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAll(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 ml-1 shadow-sm cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Xem tất cả ({filteredPosts.length})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAll(false);
                    setCurrentPage(1);
                    const el = document.getElementById('blog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thu gọn (Chia thành {totalPages} trang)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Không tìm thấy bài viết phù hợp với từ khóa "{searchQuery}".</p>
          </div>
        )}

        {/* Dedicated Direct Blog Edit Modal for Admin */}
        <BlogEditModal
          isOpen={editingBlog !== undefined}
          onClose={() => setEditingBlog(undefined)}
          post={editingBlog}
        />

        {/* Delete Confirmation Modal for Admin */}
        {postToDelete && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => !isDeleting && setPostToDelete(null)}
          >
            <div 
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Xác nhận xóa bài viết</h4>
                  <p className="text-[11px] text-slate-400">Thao tác dành cho Quản trị viên</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa bài viết <strong className="text-white font-semibold">"{postToDelete.title}"</strong> không? Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPostToDelete(null)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteBlogPost(postToDelete.id);
                      setPostToDelete(null);
                    } catch (err) {
                      console.error('Failed to delete blog post:', err);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-rose-950/50"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác Nhận Xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
