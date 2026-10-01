import React, { useState } from 'react';
import { Project } from '../types';
import { ProjectArtwork } from './Artwork';
import { ExternalLink, ArrowRight, GitFork, Plus, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAuth } from '../context/AuthContext';
import { ProjectEditModal } from './ProjectEditModal';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
  onOpenAdminProject?: (projectId?: string) => void;
}

export function ProjectsSection({ onSelectProject, onOpenAdminProject }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'devtools' | 'web' | 'ai-cloud'>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const { t } = useLanguage();
  const { projects, deleteProject } = usePortfolioData();
  const { isAdmin } = useAuth();

  const filterTabs = [
    { id: 'all', label: t.projects.filterAll },
    { id: 'devtools', label: 'DevOps & CI/CD' },
    { id: 'web', label: 'Web Apps' },
    { id: 'ai-cloud', label: 'Cloud & Telemetry' },
  ];

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950/60 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-cyan-400">
                01. {t.projects.badge}
              </div>
              {isAdmin && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold">
                  Chế độ Quản trị (Admin)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.projects.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {t.projects.subtitle}
            </p>
          </div>

          {/* Action Area: Admin Button + Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                title="Thêm một dự án mới vào hệ thống"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm Dự Án Mới</span>
              </button>
            )}

            {/* Interactive Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project Grid with Framer Motion AnimatePresence */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-cyan-950/20"
              >
                {/* Artwork Banner */}
                <div 
                  className="cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  <ProjectArtwork category={project.category} title={project.title} />
                </div>

                {/* Card Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    
                    {/* Zero-Pill Static Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-cyan-400 font-medium">{project.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{project.year}</span>
                    </div>

                    {/* Card Title */}
                    <h3 
                      onClick={() => onSelectProject(project)}
                      className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech stack line */}
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    {project.tags.slice(0, 4).join(' · ')}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group/btn cursor-pointer"
                    >
                      <span>{t.projects.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title={t.projects.sourceCode}
                      >
                        <GitFork className="w-4 h-4" />
                      </a>
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                        title={t.projects.liveDemo}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
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
                        onClick={() => setEditingProject(project)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                        title="Chỉnh sửa dự án này trực tiếp ngoài giao diện"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                        title="Xóa dự án này khỏi hệ thống"
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

        {/* Dedicated Direct Project Edit Modal for Admin */}
        <ProjectEditModal
          isOpen={editingProject !== undefined}
          onClose={() => setEditingProject(undefined)}
          project={editingProject}
        />

        {/* Delete Confirmation Modal for Admin */}
        {projectToDelete && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => !isDeleting && setProjectToDelete(null)}
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
                  <h4 className="text-base font-bold text-white">Xác nhận xóa dự án</h4>
                  <p className="text-[11px] text-slate-400">Thao tác dành cho Quản trị viên</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa dự án <strong className="text-white font-semibold">"{projectToDelete.title}"</strong> không? Toàn bộ thông tin dự án sẽ bị xóa khỏi cơ sở dữ liệu và không thể hoàn tác.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setProjectToDelete(null)}
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
                      await deleteProject(projectToDelete.id);
                      setProjectToDelete(null);
                    } catch (err) {
                      console.error('Failed to delete project:', err);
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
