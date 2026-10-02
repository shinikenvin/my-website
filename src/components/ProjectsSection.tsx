import React, { useState, useMemo, useEffect } from 'react';
import { Project } from '../types';
import { ProjectArtwork } from './Artwork';
import { 
  ExternalLink, ArrowRight, GitFork, Plus, Edit3, Trash2, 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, FolderGit2 
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination & "Xem thêm" settings (synced to 3 items per page like Blog)
  const PROJECTS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const { t } = useLanguage();
  const { projects, deleteProject } = usePortfolioData();
  const { isAdmin } = useAuth();

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  // Dynamic filter tabs including defaults + any custom category added by admin
  const filterTabs = useMemo(() => {
    const map = new Map<string, string>();
    map.set('devtools', 'DevOps & CI/CD');
    map.set('web', 'Web Apps');
    map.set('ai-cloud', 'Cloud & Telemetry');

    projects.forEach((p) => {
      if (p.category && !map.has(p.category)) {
        map.set(p.category, p.categoryLabel || p.category);
      }
    });

    const list: { id: string; label: string }[] = [
      { id: 'all', label: t.projects.filterAll }
    ];
    map.forEach((label, id) => {
      list.push({ id, label });
    });
    return list;
  }, [projects, t.projects.filterAll]);

  // Filter projects by both category tab and search query
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeFilter === 'all' || project.category === activeFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);

  // Paginated or expanded project list
  const displayedProjects = useMemo(() => {
    if (showAll || filteredProjects.length <= PROJECTS_PER_PAGE) {
      return filteredProjects;
    }
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, showAll, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShowAll(false);
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

          {/* Action Area: Admin Button + Search Box (matching Blog style) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

            {/* Real-time Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search / Tìm kiếm dự án..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs (Dedicated bar matching Blog section) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 mb-8 overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
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

        {/* Project Grid: 3 items per page on responsive layout */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectProject(project)}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-cyan-950/20"
              >
                {/* Visual Header */}
                <div className="cursor-pointer overflow-hidden group-hover:opacity-95 transition-opacity relative h-48 bg-slate-950">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ProjectArtwork category={project.category} title={project.title} />
                  )}
                  {project.videoUrl && (
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
                      <span className="text-cyan-400 font-medium">{project.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{project.year}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Summary / Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800/40 text-slate-500">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Card Bottom: Links & View Case Study Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                          title="View Source Code"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GitFork className="w-4 h-4" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 transition-colors"
                          title="Live Preview"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                      <span>{t.projects.viewDetails || 'Xem Case Study'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Admin Inline Controls: Sửa & Xóa (Designed consistently with Blog) */}
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

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <FolderGit2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Không tìm thấy dự án phù hợp với từ khóa "{searchQuery}".</p>
          </div>
        )}

        {/* Pagination & "Xem thêm" Controller */}
        {filteredProjects.length > PROJECTS_PER_PAGE && (
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Counter */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                {showAll
                  ? `Đang hiển thị toàn bộ ${filteredProjects.length} dự án`
                  : `Hiển thị ${(currentPage - 1) * PROJECTS_PER_PAGE + 1} - ${Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length)} trên tổng số ${filteredProjects.length} dự án (Trang ${currentPage}/${totalPages})`}
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
                    <span>Xem tất cả ({filteredProjects.length})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAll(false);
                    setCurrentPage(1);
                    const el = document.getElementById('projects');
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
