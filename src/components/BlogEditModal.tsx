import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost } from '../types';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { 
  X, BookOpen, Save, Clock, Tag, Plus, List, Sparkles, 
  Film, Image as ImageIcon, Upload, Trash2 
} from 'lucide-react';

interface BlogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: BlogPost | null;
}

export function BlogEditModal({ isOpen, onClose, post }: BlogEditModalProps) {
  const { blogPosts, addBlogPost, editBlogPost } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available blog categories from existing posts + defaults
  const availableCategories = useMemo(() => {
    const defaultCats = [
      'DevOps & CI/CD',
      'Frontend & UI',
      'Kiến trúc & Design',
      'Hiệu năng & Tối ưu',
    ];
    const set = new Set<string>(defaultCats);
    blogPosts.forEach((p) => {
      if (p.category?.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [blogPosts]);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: 'DevOps & CI/CD',
    summary: '',
    content: '',
    tags: 'GitHub Actions, CI/CD, DevOps',
    readTime: '4 phút',
    coverImage: '',
    videoUrl: '',
    videoTitle: '',
    galleryImages: [] as string[],
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    if (post) {
      const contentStr = typeof post.content === 'string'
        ? post.content
        : post.content?.sections?.[0]?.body || post.content?.introduction || '';

      const isKnown = [
        'DevOps & CI/CD',
        'Frontend & UI',
        'Kiến trúc & Design',
        'Hiệu năng & Tối ưu',
      ].includes(post.category);

      setForm({
        title: post.title || '',
        category: post.category || 'DevOps & CI/CD',
        summary: post.summary || '',
        content: contentStr,
        tags: (post.tags || []).join(', '),
        readTime: post.readTime || '4 phút',
        coverImage: post.coverImage || '',
        videoUrl: post.videoUrl || '',
        videoTitle: post.videoTitle || '',
        galleryImages: post.galleryImages ? [...post.galleryImages] : [],
      });

      if (!isKnown && post.category) {
        setIsCustomCategory(true);
        setCustomCategory(post.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategory('');
      }
    } else {
      setForm({
        title: '',
        category: 'DevOps & CI/CD',
        summary: '',
        content: '',
        tags: 'GitHub Actions, CI/CD, DevOps',
        readTime: '4 phút',
        coverImage: '',
        videoUrl: '',
        videoTitle: '',
        galleryImages: [],
      });
      setIsCustomCategory(false);
      setCustomCategory('');
    }
    setNewGalleryUrl('');
    setError(null);
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleUploadCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có kích thước dưới 2.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm(prev => ({ ...prev, coverImage: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (file.size > 2.5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setForm(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, ev.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, newGalleryUrl.trim()]
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!form.summary.trim()) {
      setError('Vui lòng nhập tóm tắt ngắn cho bài viết.');
      return;
    }

    let finalCategory = form.category;
    if (isCustomCategory) {
      if (!customCategory.trim()) {
        setError('Vui lòng nhập tên danh mục chủ đề mới cho bài viết.');
        return;
      }
      finalCategory = customCategory.trim();
    }

    setLoading(true);
    setError(null);

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const generatedSlug = form.title
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const payload: Partial<BlogPost> = {
        title: form.title.trim(),
        slug: post?.slug || (generatedSlug ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : `blog-${Date.now()}`),
        category: finalCategory,
        date: post?.date || new Date().toISOString().split('T')[0],
        readTime: form.readTime.trim() || '4 phút',
        summary: form.summary.trim(),
        tags: tagsArray.length > 0 ? tagsArray : ['DevOps', 'CI/CD'],
        coverImage: form.coverImage.trim(),
        videoUrl: form.videoUrl.trim(),
        videoTitle: form.videoTitle.trim() || 'Video Thuyết Minh & Hướng Dẫn Kỹ Thuật',
        galleryImages: form.galleryImages.filter(Boolean),
        content: {
          introduction: form.summary.trim(),
          sections: [
            {
              heading: 'Chi tiết phân tích & Thực tiễn triển khai',
              body: form.content.trim() || form.summary.trim(),
              codeSnippet: {
                language: 'yaml',
                filename: '.github/workflows/deploy.yml',
                code: 'name: CI/CD Pipeline\non:\n  push:\n    branches: [ main ]\njobs:\n  build-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run build',
              },
              bulletPoints: [
                'Tự động hóa toàn bộ quy trình kiểm thử và triển khai',
                'Kiến trúc module hóa, tái sử dụng các action có sẵn',
                'Giảm thiểu tối đa lỗi phát sinh trong môi trường production',
              ],
            },
          ],
          conclusion: 'Áp dụng các tiêu chuẩn kỹ thuật hiện đại giúp tối ưu năng suất và sự ổn định dài hạn.',
        },
        likes: post?.likes ?? 18,
      };

      if (post?.id) {
        await editBlogPost(post.id, payload);
      } else {
        await addBlogPost(payload as Omit<BlogPost, 'id'>);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError(err.message || 'Lỗi khi lưu bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {post ? 'Chỉnh Sửa Bài Viết Blog' : 'Viết Bài Blog Mới'}
              </h3>
              <p className="text-xs text-slate-400">Tùy biến nội dung, ảnh bìa, video thuyết minh & bộ sưu tập ảnh</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tiêu đề bài viết *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Tối ưu hiệu năng React 19 & Framer Motion cho Production..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              required
            />
          </div>

          {/* Category Section */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chủ đề / Danh mục</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-cyan-950/50 border border-cyan-800/50 cursor-pointer"
              >
                {isCustomCategory ? (
                  <>
                    <List className="w-3 h-3" />
                    <span>Chọn chủ đề có sẵn</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>+ Thêm chủ đề mới</span>
                  </>
                )}
              </button>
            </div>

            {!isCustomCategory ? (
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomCategory(true);
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW__" className="text-cyan-400 font-bold bg-slate-950">
                  + Thêm chủ đề mới (Tùy chỉnh)...
                </option>
              </select>
            ) : (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="VD: Trí tuệ nhân tạo (AI), Web3, An toàn thông tin..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-cyan-600/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required={isCustomCategory}
                />
              </div>
            )}
          </div>

          {/* Media Section: Cover Image, Video, Gallery */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/90 border border-cyan-900/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Film className="w-4 h-4" />
              <span>Media Đa Phương Tiện (Ảnh &amp; Video Bài Viết)</span>
            </div>

            {/* Cover Image Upload / URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Ảnh bìa bài viết (Cover Image)</span>
                <label className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-normal">
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh từ máy</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUploadCoverImage} 
                    className="hidden" 
                  />
                </label>
              </label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="Dán URL hình ảnh minh họa (VD: https://... hoặc tải từ máy)"
                className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              {form.coverImage && (
                <div className="relative mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-800 group">
                  <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coverImage: '' })}
                    className="absolute top-2 right-2 p-1 rounded-md bg-slate-950/80 text-rose-400 hover:text-rose-300 hover:bg-slate-900"
                    title="Xóa ảnh bìa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Video URL & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Link Video Thuyết Minh / Demo (YouTube / Vimeo / Loom / MP4)</label>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... hoặc .mp4"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Tiêu đề video bài viết</label>
                <input
                  type="text"
                  value={form.videoTitle}
                  onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                  placeholder="VD: Video Hướng Dẫn & Thuyết Minh Kỹ Thuật"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bộ sưu tập hình ảnh &amp; Sơ đồ minh họa ({form.galleryImages.length})</span>
                </label>
                <label className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-normal">
                  <Upload className="w-3 h-3" />
                  <span>Tải thêm ảnh từ máy</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleUploadGalleryImage} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Add by URL */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Dán link sơ đồ / ảnh minh họa (VD: https://...)"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  + Thêm URL
                </button>
              </div>

              {/* Gallery Thumbnails List */}
              {form.galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
                  {form.galleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 group bg-slate-900">
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded bg-slate-950/80 text-rose-400 hover:text-white hover:bg-rose-900/80 transition-colors"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Thẻ từ khóa (Tags, phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="React 19, TypeScript, Performance"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Thời gian đọc</label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                placeholder="4 phút"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tóm tắt ngắn (Lead Summary) *</label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Tóm tắt ngắn gọn nội dung cốt lõi của bài viết..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Nội dung bài viết chi tiết *</label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nhập nội dung phân tích kỹ thuật, các giải pháp hoặc kiến trúc..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{post ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
