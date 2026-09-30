import React, { useState } from 'react';
import { Terminal, Github, Menu, X, ArrowUpRight, CheckCircle2, Download, Archive } from 'lucide-react';
import { downloadProjectZip } from '../utils/exportZip';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenCiCd: () => void;
}

export function Navbar({ activeSection, setActiveSection, onOpenCiCd }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Tổng quan' },
    { id: 'projects', label: 'Dự án' },
    { id: 'blog', label: 'Blog kỹ thuật' },
    { id: 'about', label: 'Về tôi' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single element wordmark brand in display face */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2 group whitespace-nowrap"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
          <span>Shinikenvin</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors whitespace-nowrap relative py-1 ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Download project source zip button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950/40 disabled:opacity-50"
            title="Tải toàn bộ mã nguồn (.zip) của website về máy tính"
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Tải Code (.zip)</span>
            <span className="sm:hidden">Tải ZIP</span>
          </button>

          {/* GitHub Actions CI/CD button */}
          <button
            onClick={onOpenCiCd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/60 hover:border-cyan-700 transition-colors whitespace-nowrap"
            title="Xem cấu hình CI/CD GitHub Actions cho GitHub Pages"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CI/CD Deploy</span>
            <span className="sm:hidden">CI/CD</span>
          </button>

          {/* Contact or GitHub Button */}
          <a
            href="https://github.com/shinikenvin"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 border border-slate-700/80 rounded-lg hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </a>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-950/50 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCiCd();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Cấu hình CI/CD GitHub</span>
            </button>
            <a
              href="https://github.com/shinikenvin"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 rounded-lg flex items-center justify-center gap-1"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
