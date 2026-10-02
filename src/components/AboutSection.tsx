import React, { useState } from 'react';
import { Briefcase, Code2, Sparkles, CheckCircle2, Edit3, Plus, Shield, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAuth } from '../context/AuthContext';
import { ExperienceItem, SkillGroup } from '../types';
import { ExperienceEditModal } from './ExperienceEditModal';
import { SkillGroupEditModal } from './SkillGroupEditModal';

interface AboutSectionProps {
  onOpenAdminExperience?: (experienceId?: string) => void;
}

export function AboutSection({ onOpenAdminExperience }: AboutSectionProps) {
  const { t } = useLanguage();
  const { 
    experiences, 
    deleteExperience, 
    skillGroups, 
    addSkillGroup, 
    editSkillGroup, 
    deleteSkillGroup, 
    resetSkillsToDefault 
  } = usePortfolioData();
  const { isAdmin } = useAuth();

  // Experience edit & delete state
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null | undefined>(undefined);
  const [expToDelete, setExpToDelete] = useState<ExperienceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Skill group edit & delete state
  const [editingSkillGroup, setEditingSkillGroup] = useState<SkillGroup | null | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = useState<SkillGroup | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

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

  const handleSaveSkillGroup = async (group: SkillGroup) => {
    if (editingSkillGroup?.id) {
      await editSkillGroup(editingSkillGroup.id, group);
    } else {
      await addSkillGroup(group);
    }
  };

  const handleDeleteGroupConfirm = async () => {
    if (!groupToDelete?.id && !groupToDelete?.title) return;
    setIsDeletingGroup(true);
    try {
      await deleteSkillGroup(groupToDelete.id || groupToDelete.title);
      setGroupToDelete(null);
    } catch (err: any) {
      alert(`Lỗi khi xóa nhóm kỹ năng: ${err.message || 'Vui lòng thử lại'}`);
    } finally {
      setIsDeletingGroup(false);
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
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-10">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="relative group/exp">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover/exp:scale-125 transition-transform" />

                <div className="space-y-3 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{exp.role}</span>
                        <span className="text-cyan-400 font-normal">@ {exp.company}</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {exp.period} · {exp.location}
                      </p>
                    </div>

                    {/* Admin Actions: Sửa & Xóa Trực Tiếp */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setEditingExperience(exp)}
                          className="px-2.5 py-1 text-xs text-cyan-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-cyan-900/40"
                          title="Chỉnh sửa vị trí này trực tiếp"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpToDelete(exp)}
                          className="px-2.5 py-1 text-xs text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-rose-900/40"
                          title="Xóa vị trí kinh nghiệm này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Skills tags */}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="pt-2 text-xs font-mono text-cyan-300/90 flex flex-wrap items-center">
                      <span className="text-slate-300 font-medium mr-2">{t.about.tabSkills}:</span>
                      <span>{exp.skills.join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills Matrix with Full Customization */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {t.about.tabSkills}
              </h3>
            </div>

            {/* Admin Controls for Skills */}
            {isAdmin && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSkillGroup(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Thêm Nhóm Kỹ Năng</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Khôi phục danh sách kỹ năng công nghệ về các nhóm mặc định ban đầu?')) {
                      await resetSkillsToDefault();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors cursor-pointer"
                  title="Khôi phục danh sách kỹ năng ban đầu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {skillGroups.map((group, gIdx) => (
              <div 
                key={group.id || gIdx} 
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-5 hover:border-slate-700/80 transition-colors group/card"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-white leading-tight">
                      {group.title}
                    </h4>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover/card:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingSkillGroup(group)}
                          className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-950/50 transition-colors cursor-pointer"
                          title="Chỉnh sửa nhóm kỹ năng này"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGroupToDelete(group)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Xóa nhóm kỹ năng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {group.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${skill.highlight ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}>
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

      {/* Dedicated Direct Skill Group Edit Modal */}
      <SkillGroupEditModal
        isOpen={editingSkillGroup !== undefined}
        onClose={() => setEditingSkillGroup(undefined)}
        group={editingSkillGroup}
        onSave={handleSaveSkillGroup}
      />

      {/* Delete Confirmation Modal for Experience */}
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

      {/* Delete Confirmation Modal for Skill Group */}
      {groupToDelete && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeletingGroup && setGroupToDelete(null)}
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
                <h4 className="text-base font-bold text-white">Xác nhận xóa nhóm kỹ năng</h4>
                <p className="text-[11px] text-slate-400">Thao tác dành cho Quản trị viên</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa nhóm kỹ năng <strong className="text-white font-semibold">"{groupToDelete.title}"</strong> cùng toàn bộ kỹ năng bên trong không? Thao tác này sẽ cập nhật ngay vào cơ sở dữ liệu.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                disabled={isDeletingGroup}
                onClick={() => setGroupToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingGroup}
                onClick={handleDeleteGroupConfirm}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-950/40"
              >
                {isDeletingGroup ? (
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
