import React, { useState, useEffect } from 'react';
import { SkillGroup, SkillItem } from '../types';
import { X, Code2, Save, Plus, Trash2, Sparkles, Sliders } from 'lucide-react';

interface SkillGroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: SkillGroup | null;
  onSave: (group: SkillGroup) => Promise<void>;
}

export function SkillGroupEditModal({ isOpen, onClose, group, onSave }: SkillGroupEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<SkillItem[]>([]);

  useEffect(() => {
    if (group) {
      setTitle(group.title || '');
      setDescription(group.description || '');
      setSkills(group.skills ? JSON.parse(JSON.stringify(group.skills)) : []);
    } else {
      setTitle('');
      setDescription('');
      setSkills([
        { name: '', experience: '3 năm', level: 90, highlight: false },
      ]);
    }
    setError(null);
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    setSkills([
      ...skills,
      { name: '', experience: '3 năm', level: 85, highlight: false }
    ]);
  };

  const handleSkillChange = (index: number, field: keyof SkillItem, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên nhóm kỹ năng.');
      return;
    }

    const validSkills = skills.filter(s => s.name.trim() !== '');
    if (validSkills.length === 0) {
      setError('Vui lòng thêm ít nhất một kỹ năng có tên hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: SkillGroup = {
        id: group?.id || `group-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        skills: validSkills.map(s => ({
          name: s.name.trim(),
          experience: s.experience.trim() || '1 năm',
          level: Math.max(1, Math.min(100, Number(s.level) || 80)),
          highlight: Boolean(s.highlight),
        })),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving skill group:', err);
      setError(err.message || 'Lỗi khi lưu nhóm kỹ năng. Vui lòng thử lại.');
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
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {group ? 'Chỉnh Sửa Nhóm Kỹ Năng' : 'Thêm Nhóm Kỹ Năng Mới'}
              </h3>
              <p className="text-xs text-slate-400">Tùy biến nhóm, các công nghệ và mức độ thành thạo</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tên nhóm kỹ năng *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Frontend & UI Engineering, AI & Machine Learning..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Mô tả định hướng của nhóm</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Xây dựng giao diện trực quan, dễ tiếp cận và hiệu năng mượt mà..."
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* List of Skills inside Group */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Danh sách công nghệ / Kỹ năng ({skills.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddSkill}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm kỹ năng</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {skills.map((skill, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2.5 group/item transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                        placeholder="Tên công nghệ (VD: React 19, Docker, Python...)"
                        className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="text"
                        value={skill.experience}
                        onChange={(e) => handleSkillChange(idx, 'experience', e.target.value)}
                        placeholder="4 năm"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-center font-mono"
                        title="Kinh nghiệm (VD: 4 năm, 2 năm)"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Xóa kỹ năng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono w-16">
                        Level: <strong className="text-cyan-300 font-bold">{skill.level}%</strong>
                      </span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={skill.level}
                        onChange={(e) => handleSkillChange(idx, 'level', parseInt(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer shrink-0 select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(skill.highlight)}
                        onChange={(e) => handleSkillChange(idx, 'highlight', e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-cyan-500 accent-cyan-400 focus:ring-0"
                      />
                      <span className={skill.highlight ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                        Nổi bật (Highlight)
                      </span>
                    </label>
                  </div>
                </div>
              ))}
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
                  <span>{group ? 'Cập Nhật Nhóm Kỹ Năng' : 'Tạo Nhóm Kỹ Năng'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
