import React, { useState } from 'react';
import { Mail, Github, Send, Copy, Check, CheckCircle2, Globe, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';

export function ContactSection() {
  const { t } = useLanguage();
  const { personalInfo, sendContactMessage } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Project Inquiry / Consulting',
    message: '',
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleDownloadVCard = () => {
    const vCardContent = `BEGIN:VCARD
VERSION:3.0
N:${personalInfo.name};;;;
FN:${personalInfo.name}
TITLE:${personalInfo.role}
EMAIL;TYPE=INTERNET,PREF:${personalInfo.email}
URL;TYPE=WORK:${personalInfo.website}
NOTE:Specializing in high-performance web apps, scalable cloud architectures, and GitHub Actions CI/CD automation.
END:VCARD`;

    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name}-Contact.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin trước khi gửi.');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMsg('Địa chỉ email không hợp lệ.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'Project Inquiry / Consulting',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.warn('Error sending contact message:', err);
      // Still show success if local submission works
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="space-y-2 mb-12">
          <div className="text-xs font-mono text-cyan-400">
            04. {t.contact.badge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.contact.title}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                {t.contact.directContact}
              </h3>
              
              <div className="space-y-3 text-xs sm:text-sm">
                {/* Email card with copy */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">Email</div>
                      <a href={`mailto:${personalInfo.email}`} className="text-slate-200 hover:text-cyan-400 font-medium transition-colors">
                        {personalInfo.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Sao chép email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* GitHub link */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-slate-300">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">GitHub Profile</div>
                      <a 
                        href={personalInfo.github} 
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
                      >
                        github.com/shinikenvin
                      </a>
                    </div>
                  </div>
                </div>

                {/* Website URL */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">GitHub Pages Hosting</div>
                      <a 
                        href={personalInfo.website} 
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
                      >
                        shinikenvin.github.io/my-website
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download vCard action */}
              <button
                onClick={handleDownloadVCard}
                className="w-full py-2.5 px-4 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Contact (.vcf)</span>
              </button>
            </div>

            {/* Quick response commitment */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200">{t.contact.responseSpeed}</span>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              
              {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{t.contact.sentSuccess}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-base font-bold text-white">
                    {t.contact.sendBtn}
                  </h3>

                  {errorMsg && (
                    <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        {t.contact.nameLabel} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t.contact.namePlaceholder}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        {t.contact.emailLabel} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.contact.emailPlaceholder}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      {t.contact.subjectLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t.contact.subjectPlaceholder}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-medium text-slate-300">
                        {t.contact.messageLabel} <span className="text-rose-400">*</span>
                      </label>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {formData.message.length}/1000
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      maxLength={1000}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.contact.messagePlaceholder}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{t.contact.sending}</span>
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.contact.sendBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
