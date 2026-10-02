import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { 
  X, FolderGit2, Save, Sparkles, ExternalLink, GitFork, Plus, Check, List, 
  Film, Image as ImageIcon, Upload, Trash2 
} from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectEditModal({ isOpen, onClose, project }: ProjectEditModalProps) {
  const { projects, addProject, editProject } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic available categories from existing projects + defaults
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    map.set('devtools', 'DevOps & Automation');
    map.set('web', 'Web Application');
    map.set('ai-cloud', 'Cloud Architecture');
    map.set('mobile', 'Mobile Application');

    projects.forEach((p) => {
      if (p.category && !map.has(p.category)) {
        map.set(p.category, p.categoryLabel || p.category);
      }
    });

    const list: { id: string; label: string }[] = [];
    map.forEach((label, id) => list.push({ id, label }));
    return list;
  }, [projects]);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryLabel, setCustomCategoryLabel] = useState('');
  const [customCategoryKey, setCustomCategoryKey] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: 'devtools',
    categoryLabel: 'DevOps & Automation',
    year: '2026',
    description: '',
    longDescription: '',
    tags: 'React, TypeScript, CI/CD',
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    coverImage: '',
    videoUrl: '',
    videoTitle: '',
    galleryImages: [] as string[],
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    if (project) {
      const isKnown = ['devtools', 'web', 'ai-cloud', 'mobile'].includes(project.category);
      const isCustom = !isKnown && Boolean(project.category);

      setForm({
        title: project.title || '',
        category: project.category || 'devtools',
        categoryLabel: project.categoryLabel || 'DevOps & Automation',
        year: project.year || '2026',
        description: project.description || '',
        longDescription: project.fullCaseStudy?.overview || project.description || '',
        tags: (project.tags || []).join(', '),
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
        coverImage: project.coverImage || '',
        videoUrl: project.videoUrl || '',
        videoTitle: project.videoTitle || '',
        galleryImages: project.galleryImages ? [...project.galleryImages] : [],
      });

      if (isCustom) {
        setIsCustomCategory(true);
        setCustomCategoryKey(project.category);
        setCustomCategoryLabel(project.categoryLabel || project.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategoryKey('');
        setCustomCategoryLabel('');
      }
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
        coverImage: '',
        videoUrl: '',
        videoTitle: '',
        galleryImages: [],
      });
      setIsCustomCategory(false);
      setCustomCategoryKey('');
      setCustomCategoryLabel('');
    }
    setNewGalleryUrl('');
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleCustomCategoryLabelChange = (val: string) => {
    setCustomCategoryLabel(val);
    const slug = val
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setCustomCategoryKey(slug);
  };

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
      setError('Vui lòng nhập tên dự án.');
      return;
    }
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả dự án.');
      return;
    }

    let finalCategory = form.category;
    let finalCategoryLabel = form.categoryLabel;

    if (isCustomCategory) {
      if (!customCategoryLabel.trim()) {
        setError('Vui lòng nhập tên danh mục tùy chỉnh.');
        return;
      }
      finalCategory = customCategoryKey.trim() || customCategoryLabel.trim().toLowerCase().replace(/\s+/g, '-');
      finalCategoryLabel = customCategoryLabel.trim();
    } else {
      const match = availableCategories.find(c => c.id === form.category);
      finalCategory = form.category;
      finalCategoryLabel = match?.label || form.category;
    }

    setLoading(true);
    setError(null);

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const payload: Partial<Project> = {
        title: form.title.trim(),
        subtitle: form.description.trim(),
        category: finalCategory,
        categoryLabel: finalCategoryLabel,
        year: form.year.trim() || '2026',
        description: form.description.trim(),
        coverImage: form.coverImage.trim(),
        videoUrl: form.videoUrl.trim(),
        videoTitle: form.videoTitle.trim() || 'Video Demo Giới Thiệu Dự Án',
        galleryImages: form.galleryImages.filter(Boolean),
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
        await addProject(payload as Omit<Project, 'id'>);
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
              <p className="text-xs text-slate-400">Tùy biến thông tin, ảnh bìa, video demo & bộ sưu tập ảnh</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tên dự án *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: NexusFlow Automation Pipeline"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
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
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Danh mục phân loại</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-cyan-950/50 border border-cyan-800/50 cursor-pointer"
              >
                {isCustomCategory ? (
                  <>
                    <List className="w-3 h-3" />
                    <span>Chọn danh mục có sẵn</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>+ Thêm danh mục mới</span>
                  </>
                )}
              </button>
            </div>

            {!isCustomCategory ? (
              <div className="space-y-1.5">
                <select
                  value={form.category}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    if (selectedVal === '__NEW__') {
                      setIsCustomCategory(true);
                    } else {
                      const match = availableCategories.find(c => c.id === selectedVal);
                      setForm({ 
                        ...form, 
                        category: selectedVal, 
                        categoryLabel: match?.label || selectedVal 
                      });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({cat.id})
                    </option>
                  ))}
                  <option value="__NEW__" className="text-cyan-400 font-bold bg-slate-950">
                    + Nhập danh mục mới (Tùy chỉnh)...
                  </option>
                </select>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Tên danh mục hiển thị *</label>
                    <input
                      type="text"
                      value={customCategoryLabel}
                      onChange={(e) => handleCustomCategoryLabelChange(e.target.value)}
                      placeholder="VD: Trí tuệ nhân tạo (AI & Agents)..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-cyan-600/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required={isCustomCategory}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Mã phân loại (Key ID)</label>
                    <input
                      type="text"
                      value={customCategoryKey}
                      onChange={(e) => setCustomCategoryKey(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                      placeholder="VD: ai-agents, mobile..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Media Section: Cover Image, Video Demo, Gallery */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/90 border border-cyan-900/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Film className="w-4 h-4" />
              <span>Media Đa Phương Tiện (Ảnh &amp; Video Giới Thiệu)</span>
            </div>

            {/* Cover Image Upload / URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Ảnh bìa dự án (Cover Image)</span>
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
                placeholder="Dán URL hình ảnh (VD: https://... hoặc tải từ máy)"
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
                <label className="text-xs font-medium text-slate-300">Link Video Demo (YouTube / Vimeo / Loom / MP4)</label>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... hoặc .mp4"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Tiêu đề video giới thiệu</label>
                <input
                  type="text"
                  value={form.videoTitle}
                  onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                  placeholder="VD: Video Demo Hệ Thống Thực Tế"
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bộ sưu tập ảnh chụp màn hình ({form.galleryImages.length})</span>
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
                  placeholder="Dán link ảnh screenshot (VD: https://...)"
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Công nghệ sử dụng (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="React, TypeScript, Docker, CI/CD, Tailwind CSS"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
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
