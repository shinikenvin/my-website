import React, { useEffect } from 'react';
import { Project } from '../types';
import { X, ExternalLink, GitFork, CheckCircle2, Layers, Cpu, TrendingUp } from 'lucide-react';
import { ProjectArtwork } from './Artwork';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-cyan-400">
              {project.categoryLabel} <span className="text-slate-600">·</span> {project.year}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Header Artwork */}
        <div className="w-full">
          <ProjectArtwork category={project.category} title={project.title} />
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Subtitle & High-Level Description */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-200">
              {project.subtitle}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {project.fullCaseStudy.overview}
            </p>
          </div>

          {/* Metrics Highlight Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            {project.fullCaseStudy.metrics.map((metric, idx) => (
              <div key={idx} className="text-center space-y-1">
                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Problem vs Solution Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                <TrendingUp className="w-4 h-4" />
                <span>Thách thức kỹ thuật</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.fullCaseStudy.challenge}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Giải pháp triển khai</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.fullCaseStudy.solution}
              </p>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Kiến trúc hệ thống & Luồng dữ liệu</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {project.fullCaseStudy.architecture.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-cyan-400 mt-1 font-mono text-xs">0{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Tính năng cốt lõi đã hoàn thiện</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {project.fullCaseStudy.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-950/40 border border-slate-800/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack - Zero-Pill text discipline */}
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 mr-2">Công nghệ:</span>
            <span>{project.tags.join(' · ')}</span>
          </div>

          {/* Action CTAs in Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <GitFork className="w-4 h-4" />
              <span>Xem Repository</span>
            </a>

            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>Trải nghiệm Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
