import React, { useState } from 'react';
import { Project } from '../types';
import { ProjectArtwork } from './Artwork';
import { ExternalLink, ArrowRight, GitFork } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'devtools' | 'web' | 'ai-cloud'>('all');
  const { t } = useLanguage();
  const { projects } = usePortfolioData();

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
    <section id="projects" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan-400">
              01. {t.projects.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.projects.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {t.projects.subtitle}
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
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
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group/btn"
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

                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
