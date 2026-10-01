import React, { useState, useEffect } from 'react';
import { ExperienceItem } from '../types';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { X, Briefcase, Save, Building2, Calendar, MapPin, Sparkles } from 'lucide-react';

interface ExperienceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: ExperienceItem | null;
}

export function ExperienceEditModal({ isOpen, onClose, experience }: ExperienceEditModalProps) {
  const { addExperience, editExperience, experiences } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: '',
    company: '',
    period: '2026 — Hiện tại',
    location: 'Việt Nam & Remote',
    description: '',
    highlights: 'Dẫn dắt phát triển hệ thống web phân tán\nTối ưu hóa hiệu năng và pipeline CI/CD',
    skills: 'React, TypeScript, Tailwind CSS, Docker',
    order: 1,
  });

  useEffect(() => {
    if (experience) {
      setForm({
        role: experience.role || '',
        company: experience.company || '',
        period: experience.period || '2026 — Hiện tại',
        location: experience.location || 'Việt Nam & Remote',
        description: experience.description || '',
        highlights: (experience.highlights || []).join('\n'),
        skills: (experience.skills || []).join(', '),
        order: experience.order ?? 1,
      });
    } else {
      const maxOrder = experiences.length > 0 ? Math.max(...experiences.map(e => e.order || 0)) : 0;
      setForm({
        role: '',
        company: '',
        period: '2026 — Hiện tại',
        location: 'Việt Nam & Remote',
        description: '',
        highlights: 'Phát triển kiến trúc giao diện hiện đại\nTối ưu hóa trải nghiệm người dùng',
        skills: 'React, TypeScript, Tailwind CSS',
        order: maxOrder + 1,
      });
    }
    setError(null);
  }, [experience, isOpen, experiences]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim()) {
      setError('Vui lòng nhập chức danh / vị trí công việc.');
      return;
    }
    if (!form.company.trim()) {
      setError('Vui lòng nhập tên công ty / tổ chức.');
      return;
    }
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả công việc tóm tắt.');
      return;
    }

    setLoading(true);
    setError(null);

    const highlightsArray = form.highlights
      .split('\n')
      .map(h => h.trim().replace(/^[•\-\*▸\s]+/, ''))
      .filter(Boolean);

    const skillsArray = form.skills
      .split(/[,·]/)
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Omit<ExperienceItem, 'id'> = {
      role: form.role.trim(),
      company: form.company.trim(),
      period: form.period.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      highlights: highlightsArray.length > 0 ? highlightsArray : ['Đóng góp phát triển và tối ưu ứng dụng'],
      skills: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
      order: Number(form.order) || 1,
    };

    try {
      if (experience?.id) {
        await editExperience(experience.id, payload);
      } else {
        await addExperience(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu mục kinh nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(experience?.id);

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isEditing ? 'Chỉnh Sửa Vị Trí Kinh Nghiệm' : 'Thêm Vị Trí Kinh Nghiệm Mới'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Admin Trực Tiếp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Cập nhật trực tiếp thông tin kinh nghiệm hiển thị trên website' : 'Thêm một vị trí công tác mới vào dòng thời gian'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chức danh / Vị trí công việc <span className="text-rose-400">*</span>
              </label>
              <input 
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="VD: Senior Frontend Engineer / Tech Lead"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Công ty / Tổ chức <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="VD: Global Tech Corp"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Thời gian làm việc</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="VD: 2024 — Hiện tại"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Địa điểm / Hình thức</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="VD: Hà Nội & Remote"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Thứ tự hiển thị (Order)</label>
              <input 
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Mô tả ngắn gọn về vai trò <span className="text-rose-400">*</span>
            </label>
            <textarea 
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="VD: Chịu trách nhiệm thiết kế hệ thống giao diện, tối ưu hoá trải nghiệm người dùng và phối hợp liên phòng ban..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Điểm nổi bật / Thành tựu đạt được (mỗi dòng một ý)
            </label>
            <textarea 
              rows={3}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              placeholder="Tối ưu thời gian tải trang giảm 45%&#10;Triển khai pipeline CI/CD tự động hoá 100%&#10;Mentoring cho 6 lập trình viên junior"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Kỹ năng & Công nghệ chính (ngăn cách bởi dấu phẩy)
            </label>
            <input 
              type="text"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="VD: React, TypeScript, Next.js, Docker, Kubernetes"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Thêm Kinh Nghiệm')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
