import React, { useState } from 'react';
import { SKILL_GROUPS } from '../data/portfolioData';
import { Briefcase, Code2, Sparkles, CheckCircle2, Edit3, Plus, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAuth } from '../context/AuthContext';
import { ExperienceItem } from '../types';
import { ExperienceEditModal } from './ExperienceEditModal';

interface AboutSectionProps {
  onOpenAdminExperience?: (experienceId?: string) => void;
}

export function AboutSection({ onOpenAdminExperience }: AboutSectionProps) {
  const { t } = useLanguage();
  const { experiences, deleteExperience } = usePortfolioData();
  const { isAdmin } = useAuth();

  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null | undefined>(undefined);
  const [expToDelete, setExpToDelete] = useState<ExperienceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteExpConfirm = async () => {
    if (!expToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteExperience(expToDelete.id);
      setExpToDelete(null);
    } catch (err: any) {
      alert(`Lỗi khi xóa kinh nghiệm: ${err.message || 'Vui lòng thử lại'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="about" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950/70 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-cyan-400">
              03. {t.about.badge}
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Thêm Vị Trí Kinh Nghiệm</span>
              </button>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {t.about.subtitle}
          </p>
        </div>

        {/* 3 Core Engineering Principles Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Performance & Fluid UX</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mọi tương tác được tối ưu ở tần số 60 FPS, nói không với layout shift và đảm bảo điểm số Core Web Vitals luôn đạt mức tối đa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero-Pill & Editorial Aesthetics</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Áp dụng triết lý Zero-Pill, phối màu chuẩn 60-30-10 và phân cấp typography rõ ràng để mang lại vẻ ngoài chững chạc và chuyên nghiệp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub Actions Automated CI/CD</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mọi dự án đều được thiết lập pipeline tự động kiểm thử và deploy qua GitHub Actions, loại bỏ hoàn toàn các thao tác thủ công dễ sai lệch.
            </p>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {t.about.tabExperience}
              </h3>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="px-3 py-1.5 text-xs text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 hover:border-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm vị trí kinh nghiệm</span>
              </button>
            )}
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-10">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

                <div className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors relative">
                  {/* Admin Inline Controls on item */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingExperience(exp)}
                        className="px-2.5 py-1 text-xs text-cyan-300 hover:text-white bg-slate-950/90 hover:bg-slate-800 border border-cyan-800/60 hover:border-cyan-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Chỉnh sửa mục kinh nghiệm này trực tiếp"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpToDelete(exp)}
                        className="px-2.5 py-1 text-xs text-rose-300 hover:text-white bg-slate-950/90 hover:bg-rose-900/40 border border-rose-800/60 hover:border-rose-400 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xóa mục kinh nghiệm này"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pr-24 sm:pr-28">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {exp.role}
                      </h4>
                      <div className="text-xs text-cyan-400 font-medium">
                        {exp.company} <span className="text-slate-600">·</span> {exp.location}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400 tabular-nums">
                      {exp.period}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-cyan-400 mt-0.5">▸</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Skills tags */}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/70">
                      <span className="text-slate-300 font-medium mr-2">{t.about.tabSkills}:</span>
                      <span>{exp.skills.join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills Matrix */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {t.about.tabSkills}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SKILL_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-5">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {group.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {group.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${skill.highlight ? 'text-cyan-300' : 'text-slate-300'}`}>
                          {skill.name}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {skill.experience} · {skill.level}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            skill.highlight
                              ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                              : 'bg-slate-500'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dedicated Direct Experience Edit Modal */}
      <ExperienceEditModal
        isOpen={editingExperience !== undefined}
        onClose={() => setEditingExperience(undefined)}
        experience={editingExperience}
      />

      {/* Delete Confirmation Modal */}
      {expToDelete && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setExpToDelete(null)}
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
                <h4 className="text-base font-bold text-white">Xác nhận xóa kinh nghiệm</h4>
                <p className="text-[11px] text-slate-400">Thao tác dành cho Quản trị viên</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa vị trí <strong className="text-white font-semibold">"{expToDelete.role} tại {expToDelete.company}"</strong> không? Thông tin này sẽ bị xóa khỏi cơ sở dữ liệu và không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setExpToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteExpConfirm}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-950/40"
              >
                {isDeleting ? (
                  <span>Đang xóa...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
