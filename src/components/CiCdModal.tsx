import React, { useEffect } from 'react';
import { X, Terminal, ExternalLink, CheckCircle2, ArrowRight, ShieldCheck, Zap, GitBranch, Globe, Server } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface CiCdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CiCdModal({ isOpen, onClose }: CiCdModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pipelineStages = [
    {
      step: '01',
      title: 'Trigger (Push)',
      description: 'Lắng nghe mọi lượt cập nhật đẩy lên nhánh chính (main)',
      icon: GitBranch,
      status: 'Auto Trigger',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    },
    {
      step: '02',
      title: 'Cloud Runner',
      description: 'Khởi động máy chủ ảo Ubuntu trên hạ tầng đám mây GitHub',
      icon: Server,
      status: 'Isolated & Secure',
      badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    },
    {
      step: '03',
      title: 'Build & Optimize',
      description: 'Tự động kiểm tra cú pháp, nén tài nguyên và đóng gói bundle Vite',
      icon: Zap,
      status: 'High Speed',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    },
    {
      step: '04',
      title: 'Global Deploy',
      description: 'Đẩy gói web tĩnh lên mạng lưới phân phối CDN của GitHub Pages',
      icon: Globe,
      status: 'Live & Serving',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    },
  ];

  const specs = [
    { label: 'Trigger Mechanism', value: 'Auto on Push' },
    { label: 'Build Duration', value: '~35 - 45s' },
    { label: 'Runner OS', value: 'Ubuntu Latest' },
    { label: 'Security', value: 'HTTPS / SSL 256-bit' },
    { label: 'Concurrency', value: 'Auto Cancel In-Progress' },
    { label: 'Edge Network', value: 'GitHub Pages CDN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800/70 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t.cicd.title}
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.cicd.activeStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.cicd.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Target Domain Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-950/60 to-slate-900 border border-cyan-900/50 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {t.cicd.officialAddress}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {t.cicd.instantUpdate}
              </span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <a
                href={PERSONAL_INFO.website}
                target="_blank"
                rel="noreferrer noopener"
                className="text-base sm:text-lg font-mono font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-2 group"
              >
                <span>{PERSONAL_INFO.website}</span>
                <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Pipeline Flow Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                {t.cicd.pipelineArch}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">{t.cicd.fourStages}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pipelineStages.map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div
                    key={stage.step}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {stage.step}
                        </span>
                        <h4 className="text-sm font-semibold text-white">
                          {stage.title}
                        </h4>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        <IconComponent className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                      <span className={`px-2 py-0.5 rounded border ${stage.badgeColor}`}>
                        {stage.status}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Specifications */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.cicd.standards}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((item) => (
                <div key={item.label} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {item.label}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 font-mono mt-1">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Operates */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{t.cicd.howItWorks}</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-cyan-400 leading-relaxed">
              <li>{t.cicd.howItWorks1}</li>
              <li>{t.cicd.howItWorks2}</li>
              <li>{t.cicd.howItWorks3}</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{t.cicd.connectedRepo}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              {t.cicd.close}
            </button>
            <a
              href={PERSONAL_INFO.website}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <span>{t.cicd.visitWebsite}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
