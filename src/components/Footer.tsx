import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { ArrowUp, Terminal, Github, Heart } from 'lucide-react';

interface FooterProps {
  onOpenCiCd: () => void;
}

export function Footer({ onOpenCiCd }: FooterProps) {
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
              Trang web cá nhân phát triển bằng React 19, Tailwind CSS &amp; Framer Motion.
            </p>
          </div>

          {/* Quick link navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <a href="#hero" className="hover:text-white transition-colors">
              Tổng quan
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              Dự án
            </a>
            <a href="#blog" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              Về tôi
            </a>
            <button
              onClick={onOpenCiCd}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CI/CD Workflow</span>
            </button>
            <a
              href="https://github.com/shinikenvin"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-[11px] font-mono">Đầu trang</span>
          </button>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Shinikenvin. Mọi bản quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-1">
            <span>Sẵn sàng deploy lên</span>
            <a
              href={PERSONAL_INFO.website}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 underline font-mono"
            >
              shinikenvin.github.io/my-website
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
