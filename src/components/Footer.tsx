import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface FooterProps {
  onOpenCiCd?: () => void;
}

export function Footer({}: FooterProps) {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-xs text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & summary */}
          <div className="space-y-1 text-center md:text-left">
            <div className="text-base font-bold text-white tracking-tight">
              Shinikenvin
            </div>
            <p className="text-slate-400 text-xs">
              {t.footer.builtWith}
            </p>
          </div>

          {/* Quick link navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <a href="#hero" className="hover:text-cyan-400 transition-colors">
              {t.nav.overview}
            </a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">
              {t.nav.projects}
            </a>
            <a href="#blog" className="hover:text-cyan-400 transition-colors">
              {t.nav.blog}
            </a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              {t.nav.skills}
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              {t.nav.contact}
            </a>
          </div>

          {/* Language and Back to top button */}
          <div className="flex items-center gap-2.5">
            <LanguageSelector />
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[11px] font-mono">Top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {t.footer.rights}
          </div>
          <div className="flex items-center gap-1">
            <span>Portfolio:</span>
            <a
              href="#hero"
              className="text-slate-400 hover:text-cyan-400 underline font-mono"
            >
              Shinikenvin Developer
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
