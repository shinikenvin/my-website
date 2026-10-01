import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { X, FolderGit2, Save, Sparkles, ExternalLink, GitFork } from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectEditModal({ isOpen, onClose, project }: ProjectEditModalProps) {
  const { addProject, editProject } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'devtools' as 'devtools' | 'web' | 'ai-cloud',
    categoryLabel: 'DevOps & Automation',
    year: '2026',
    description: '',
    longDescription: '',
    tags: 'React, TypeScript, CI/CD',
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
  });

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        category: (project.category as any) || 'devtools',
        categoryLabel: project.categoryLabel || 'DevOps & Automation',
        year: project.year || '2026',
        description: project.description || '',
        longDescription: project.fullCaseStudy?.overview || project.description || '',
        tags: (project.tags || []).join(', '),
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
      });
    } else {
      setForm({
        title: '',
        category: 'devtools',
        categoryLabel: 'DevOps & Automation',
        year: new Date().getFullYear().toString(),
        description: '',
        longDescription: '',
        tags: 'React, TypeScript, Tailwind CSS',
        demoUrl: '',
        githubUrl: '',
      });
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Vui lòng nhập tên dự án.');
      return;
    }
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả dự án.');
      return;
    }

    setLoading(true);
    setError(null);

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const categoryLabels: Record<string, string> = {
      'devtools': 'DevOps & Automation',
      'web': 'Web Application',
      'ai-cloud': 'Cloud Architecture',
    };

    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.description.trim(),
        category: form.category,
        categoryLabel: categoryLabels[form.category] || 'Software',
        year: form.year.trim() || '2026',
        description: form.description.trim(),
        fullCaseStudy: {
          overview: form.longDescription.trim() || form.description.trim(),
          challenge: project?.fullCaseStudy?.challenge || 'Tối ưu hóa hiệu năng, giảm thiểu độ trễ và đảm bảo tính khả dụng cao.',
          solution: project?.fullCaseStudy?.solution || 'Ứng dụng kiến trúc phân tán, pipeline CI/CD tự động và tối ưu tài nguyên tĩnh.',
          architecture: project?.fullCaseStudy?.architecture || ['React 19 Frontend', 'Vite Bundler', 'GitHub Actions CI/CD', 'CDN'],
          keyFeatures: project?.fullCaseStudy?.keyFeatures || ['Tự động kiểm thử', 'Đóng gói tối ưu', 'Triển khai không gián đoạn'],
          metrics: project?.fullCaseStudy?.metrics || [
            { label: 'Uptime', value: '99.9%' },
            { label: 'Build Time', value: '42s' },
          ],
        },
        tags: tagsArray.length > 0 ? tagsArray : ['React', 'TypeScript'],
        demoUrl: form.demoUrl.trim() || 'https://shinikenvin.github.io/my-website/',
        githubUrl: form.githubUrl.trim() || 'https://github.com/shinikenvin/my-website',
      };

      if (project?.id) {
        await editProject(project.id, payload);
      } else {
        await addProject(payload);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Lỗi khi lưu dự án. Vui lòng thử lại.');
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
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {project ? 'Chỉnh Sửa Dự Án' : 'Thêm Dự Án Mới'}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tên dự án *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: NexusFlow Automation Pipeline..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Năm thực hiện</label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2026"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phân loại danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="devtools">DevOps & Automation</option>
                <option value="web">Web Application</option>
                <option value="ai-cloud">Cloud Architecture</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Công nghệ (phân cách bằng dấu phẩy)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="React, TypeScript, Docker, CI/CD"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Mô tả ngắn gọn (hiển thị trên thẻ card) *</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tóm tắt tính năng và điểm nổi bật của dự án..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tổng quan chi tiết (khi xem chi tiết modal)</label>
            <textarea
              rows={3}
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              placeholder="Mô tả chuyên sâu về bài toán, kiến trúc và giá trị mang lại..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Link Live Demo</span>
              </label>
              <input
                type="url"
                value={form.demoUrl}
                onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5 text-slate-400" />
                <span>Link GitHub Repository</span>
              </label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
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
                  <span>{project ? 'Cập Nhật Dự Án' : 'Lưu Dự Án Mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
