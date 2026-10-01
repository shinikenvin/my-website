/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, BlogPost } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { BlogSection } from './components/BlogSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { BlogModal } from './components/BlogModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { CiCdModal } from './components/CiCdModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldCheck } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioDataProvider } from './context/PortfolioDataContext';

function PortfolioMain() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'profile' | 'projects' | 'blog' | 'experience' | 'messages' | 'livechat' | 'security'>('profile');
  const [adminTargetExperienceId, setAdminTargetExperienceId] = useState<string | null>(null);
  const [isCiCdOpen, setIsCiCdOpen] = useState(false);

  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  // Scroll spy to update active navigation tab based on scroll position
  useEffect(() => {
    const sectionIds = ['hero', 'projects', 'blog', 'about', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = (tab: 'profile' | 'projects' | 'blog' | 'experience' | 'messages' | 'livechat' | 'security' = 'profile') => {
    setAdminInitialTab(tab);
    setAdminTargetExperienceId(null);
    if (isAdmin) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenAdminExperience = (expId?: string) => {
    setAdminInitialTab('experience');
    setAdminTargetExperienceId(expId || null);
    if (isAdmin) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 font-sans antialiased relative">
      
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={scrollToSection}
        onOpenCiCd={() => setIsCiCdOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Content Sections */}
      <main className="relative">
        <Hero 
          onExploreProjects={() => scrollToSection('projects')}
          onOpenCiCd={() => setIsCiCdOpen(true)}
          onOpenContact={() => scrollToSection('contact')}
        />

        <ProjectsSection 
          onSelectProject={(project) => setSelectedProject(project)}
        />

        <BlogSection 
          onSelectPost={(post) => setSelectedPost(post)}
        />

        <AboutSection onOpenAdminExperience={handleOpenAdminExperience} />

        <ContactSection />
      </main>

      {/* Footer */}
      <Footer onOpenCiCd={() => {}} />

      {/* Discreet Admin Quick Button bottom-left */}
      <aside aria-label="Admin Trigger" className="fixed bottom-5 left-5 z-30">
        <button
          onClick={() => handleOpenAdmin('profile')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shadow-xl backdrop-blur-md transition-all text-xs font-mono active:scale-95 ${
            isAdmin
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/90'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
          }`}
          title={isAdmin ? 'Mở Bảng Quản Trị Hệ Thống (CMS)' : 'Đăng nhập Quản Trị Viên (Admin)'}
        >
          {isAdmin ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-sans font-semibold">CMS Admin</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-sans">Admin</span>
            </>
          )}
        </button>
      </aside>

      {/* Live Online Chat Widget (Bottom-Right, PC & Mobile Responsive) */}
      <LiveChatWidget />

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <BlogModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => {
          setIsAdminDashboardOpen(false);
          setAdminTargetExperienceId(null);
        }}
        initialTab={adminInitialTab}
        targetExperienceId={adminTargetExperienceId}
      />

      {/* CI/CD Automation Modal */}
      <CiCdModal
        isOpen={isCiCdOpen}
        onClose={() => setIsCiCdOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioDataProvider>
        <LanguageProvider>
          <PortfolioMain />
        </LanguageProvider>
      </PortfolioDataProvider>
    </AuthProvider>
  );
}
