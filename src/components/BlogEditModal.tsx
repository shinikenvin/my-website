import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { X, BookOpen, Save, Clock, Tag } from 'lucide-react';

interface BlogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: BlogPost | null;
}

export function BlogEditModal({ isOpen, onClose, post }: BlogEditModalProps) {
  const { addBlogPost, editBlogPost } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'DevOps & CI/CD',
    summary: '',
    content: '',
    tags: 'GitHub Actions, CI/CD, DevOps',
    readTime: '4 phút',
  });

  useEffect(() => {
    if (post) {
      const contentStr = typeof post.content === 'string'
        ? post.content
        : post.content?.sections?.[0]?.body || post.content?.introduction || '';

      setForm({
        title: post.title || '',
        category: post.category || 'DevOps & CI/CD',
        summary: post.summary || '',
        content: contentStr,
        tags: (post.tags || []).join(', '),
        readTime: post.readTime || '4 phút',
      });
    } else {
      setForm({
        title: '',
        category: 'DevOps & CI/CD',
        summary: '',
        content: '',
        tags: 'GitHub Actions, CI/CD, DevOps',
        readTime: '4 phút',
      });
    }
    setError(null);
  }, [post, isOpen]);

  if (!isOpen) return null;

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

    setLoading(true);
    setError(null);

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        date: post?.date || new Date().toISOString().split('T')[0],
        readTime: form.readTime.trim() || '4 phút',
        summary: form.summary.trim(),
        tags: tagsArray.length > 0 ? tagsArray : ['DevOps', 'CI/CD'],
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
        await addBlogPost(payload);
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
                {post ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
              </h3>
              <p className="text-xs text-slate-400">Thao tác trực tiếp ngoài giao diện website</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
              placeholder="VD: Xây dựng Pipeline CI/CD đa môi trường với GitHub Actions..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Chủ đề danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                <option value="Frontend & UI">Frontend & UI</option>
                <option value="Kiến trúc & Design">Kiến trúc / Architecture</option>
                <option value="Hiệu năng & Tối ưu">Hiệu năng & Tối ưu</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thời gian đọc</span>
              </label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                placeholder="4 phút"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tags (phân cách bằng dấu phẩy)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="GitHub Actions, CI/CD, DevOps, React"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tóm tắt bài viết (hiển thị trên thẻ card) *</label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Tóm tắt ngắn gọn ý chính của bài viết..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Nội dung chi tiết bài viết</label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Viết nội dung bài chia sẻ, kinh nghiệm thực tế, giải pháp kỹ thuật..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px] leading-relaxed"
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
