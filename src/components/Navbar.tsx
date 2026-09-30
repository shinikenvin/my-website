import React, { useState } from 'react';
import { Terminal, Menu, X, Shield, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenCiCd: () => void;
  onOpenAdmin: () => void;
}

export function Navbar({ activeSection, setActiveSection, onOpenCiCd, onOpenAdmin }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { personalInfo } = usePortfolioData();

  const navLinks = [
    { id: 'hero', label: t.nav.overview },
    { id: 'projects', label: t.nav.projects },
    { id: 'blog', label: t.nav.blog },
    { id: 'about', label: t.nav.skills },
    { id: 'contact', label: t.nav.contact },
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
        
        {/* Zone 1: Wordmark brand */}
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

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
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

        {/* Zone 3: Actions + Language Selector + Admin */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Multi-language Selector */}
          <LanguageSelector />

          {/* Admin Button */}
          {isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 rounded-lg hover:bg-emerald-900/80 transition-colors whitespace-nowrap shadow-sm shadow-emerald-950/50"
              title="Mở Bảng Quản Trị Hệ Thống (CMS)"
            >
              {personalInfo.avatarUrl ? (
                <img 
                  src={personalInfo.avatarUrl} 
                  alt="Admin Avatar" 
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400 shrink-0" 
                />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Admin CMS</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
              title="Đăng nhập Quản Trị Viên (Admin)"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

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
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-lg"
            >
              {personalInfo.avatarUrl ? (
                <img 
                  src={personalInfo.avatarUrl} 
                  alt="Admin" 
                  className="w-4 h-4 rounded-full object-cover border border-emerald-400" 
                />
              ) : (
                <Shield className="w-3.5 h-3.5" />
              )}
              <span>{isAdmin ? 'Quản trị CMS' : 'Đăng nhập Admin'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
