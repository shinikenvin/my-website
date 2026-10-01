import React, { useState } from 'react';
import { DeveloperPortrait } from './Artwork';
import { ArrowDown, Terminal, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface HeroProps {
  onExploreProjects: () => void;
  onOpenCiCd: () => void;
  onOpenContact?: () => void;
}

export function Hero({ onExploreProjects, onOpenCiCd }: HeroProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { personalInfo } = usePortfolioData();
  const { t } = useLanguage();

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(personalInfo.email);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Bold Typography & Core Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Status indicator - unboxed clean text */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium">{t.hero.statusBadge}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">{personalInfo.location}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.15] text-balance">
              {personalInfo.heroHeadline ? (
                (() => {
                  const lines = personalInfo.heroHeadline.split('\n').filter(Boolean);
                  if (lines.length >= 3) {
                    return (
                      <>
                        {lines[0]} <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                          {lines[1]}
                        </span> <br />
                        {lines.slice(2).join(' ')}
                      </>
                    );
                  }
                  if (lines.length === 2) {
                    return (
                      <>
                        {lines[0]} <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                          {lines[1]}
                        </span>
                      </>
                    );
                  }
                  return personalInfo.heroHeadline;
                })()
              ) : (
                <>
                  {t.hero.titlePrefix}, <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                    {t.hero.titleHighlight}
                  </span> <br />
                  {t.hero.titleSuffix}
                </>
              )}
            </h1>

            {/* Bio statement */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl whitespace-pre-line">
              {personalInfo.bio || (
                <>
                  Chào bạn, tôi là <strong className="text-white font-semibold">{personalInfo.name}</strong>, một {personalInfo.role}. 
                  Tôi chuyên xây dựng các ứng dụng web hiện đại, kiến trúc đám mây ổn định, quy trình CI/CD tự động và giao diện người dùng đạt chuẩn quốc tế.
                </>
              )}
            </p>

            {/* Key Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreProjects}
                className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/40 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                <span>{t.hero.ctaProjects}</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href="#contact"
                className="px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-850 hover:border-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <span>{t.nav.contact}</span>
              </a>

              <button
                onClick={handleCopyEmail}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                title="Sao chép địa chỉ email vào bộ nhớ tạm"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{personalInfo.email}</span>
                  </>
                )}
              </button>
            </div>

            {/* Adjacent Quantitative Proof Metrics */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  4+
                </div>
                <div className="text-xs text-slate-400 font-normal leading-snug">
                  {t.hero.yearsExp}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  25+
                </div>
                <div className="text-xs text-slate-400 font-normal leading-snug">
                  {t.hero.completedProjects}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  99.9%
                </div>
                <div className="text-xs text-slate-400 font-normal leading-snug">
                  {t.hero.serviceUptime}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  100%
                </div>
                <div className="text-xs text-slate-400 font-normal leading-snug">
                  GitHub CI/CD
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Portrait & Quick Terminal Box */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[380px] space-y-4">
              
              {/* Developer Avatar (Managed exclusively via Admin CMS) */}
              <DeveloperPortrait 
                className="w-full h-[320px]" 
                avatarUrl={personalInfo.avatarUrl}
              />

              {/* Terminal Quick Card */}
              <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs space-y-2 text-slate-300 shadow-xl">
                <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800/60">
                  <span className="text-[11px] text-cyan-400">shinikenvin@developer:~</span>
                  <span>zsh · 60 FPS</span>
                </div>
                <div className="space-y-1 text-slate-400">
                  <p><span className="text-emerald-400">➜</span> <span className="text-cyan-300">target:</span> <a href={personalInfo.website} target="_blank" rel="noreferrer" className="text-slate-200 underline hover:text-cyan-400">shinikenvin.github.io/my-website/</a></p>
                  <p><span className="text-emerald-400">➜</span> <span className="text-cyan-300">tech:</span> React 19, Tailwind CSS, Vite</p>
                  <p><span className="text-emerald-400">➜</span> <span className="text-cyan-300">ci_cd:</span> GitHub Actions (Pages Artifacts)</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
