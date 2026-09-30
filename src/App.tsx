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
import { CiCdModal } from './components/CiCdModal';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCiCdOpen, setIsCiCdOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenCiCd={() => setIsCiCdOpen(true)}
      />

      {/* Main Content with subtle stagger animation */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-grow flex flex-col"
      >
        {/* Hero Section */}
        <Hero
          onExploreProjects={() => scrollToSection('projects')}
          onOpenCiCd={() => setIsCiCdOpen(true)}
          onOpenContact={() => scrollToSection('contact')}
        />

        {/* Projects Section */}
        <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />

        {/* Blog Section */}
        <BlogSection onSelectPost={(post) => setSelectedPost(post)} />

        {/* About & Skills Section */}
        <AboutSection />

        {/* Contact Section */}
        <ContactSection />
      </motion.main>

      {/* Footer */}
      <Footer onOpenCiCd={() => setIsCiCdOpen(true)} />

      {/* Floating GitHub Actions CI/CD trigger shortcut */}
      <aside aria-label="CI/CD Quick Trigger" className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsCiCdOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 text-cyan-300 border border-cyan-800/80 hover:bg-slate-850 hover:border-cyan-500 shadow-xl shadow-slate-950/80 backdrop-blur-md transition-all text-xs font-mono group active:scale-95"
          title="Mở hướng dẫn & lệnh triển khai CI/CD GitHub Actions"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-ping" />
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline font-sans font-medium">GitHub CI/CD</span>
        </button>
      </aside>

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

      <AnimatePresence>
        {isCiCdOpen && (
          <CiCdModal
            isOpen={isCiCdOpen}
            onClose={() => setIsCiCdOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
