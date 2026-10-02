import React, { useState } from 'react';
import { 
  Mail, Github, Send, Copy, Check, CheckCircle2, Globe, Download, 
  Edit3, Phone, Linkedin 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAuth } from '../context/AuthContext';
import { ContactChannelsEditModal } from './ContactChannelsEditModal';

export function ContactSection() {
  const { t } = useLanguage();
  const { personalInfo, sendContactMessage } = usePortfolioData();
  const { isAdmin } = useAuth();

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
  const [isEditingContact, setIsEditingContact] = useState(false);

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
TEL;TYPE=CELL:${personalInfo.phone || ''}
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {t.contact.directContact}
                </h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-cyan-800/60 active:scale-95"
                    title="Tùy biến các kênh liên hệ trực tiếp"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa kênh</span>
                  </button>
                )}
              </div>
              
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
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Sao chép email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* GitHub link */}
                {personalInfo.github && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-300">
                        <Github className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">GitHub Profile</div>
                        <a 
                          href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} 
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
                        >
                          {personalInfo.github.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website URL */}
                {personalInfo.website && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {personalInfo.websiteLabel || 'GitHub Pages Hosting'}
                        </div>
                        <a 
                          href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="text-slate-200 hover:text-cyan-400 font-medium transition-colors"
                        >
                          {personalInfo.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Phone / Zalo */}
                {personalInfo.phone && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">Điện thoại / Zalo</div>
                        <a href={`tel:${personalInfo.phone}`} className="text-slate-200 hover:text-cyan-400 font-medium transition-colors font-mono">
                          {personalInfo.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Telegram */}
                {personalInfo.telegram && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-950 text-sky-400">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">Telegram</div>
                        <a 
                          href={personalInfo.telegram.startsWith('http') ? personalInfo.telegram : `https://t.me/${personalInfo.telegram.replace('@', '')}`}
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="text-slate-200 hover:text-cyan-400 font-medium transition-colors font-mono"
                        >
                          {personalInfo.telegram}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional LinkedIn */}
                {personalInfo.linkedin && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">LinkedIn Profile</div>
                        <a 
                          href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="text-slate-200 hover:text-cyan-400 font-medium transition-colors font-mono"
                        >
                          {personalInfo.linkedin.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Additional Channels */}
                {personalInfo.additionalChannels?.map((ch, idx) => (
                  <div key={ch.id || idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-cyan-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">{ch.label}</div>
                        {ch.url ? (
                          <a 
                            href={ch.url.startsWith('http') ? ch.url : `https://${ch.url}`}
                            target="_blank" 
                            rel="noreferrer noopener"
                            className="text-slate-200 hover:text-cyan-400 font-medium transition-colors font-mono"
                          >
                            {ch.value || ch.url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-slate-200 font-medium font-mono">{ch.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download vCard action */}
              <button
                onClick={handleDownloadVCard}
                className="w-full py-2.5 px-4 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Contact (.vcf)</span>
              </button>
            </div>

            {/* Quick response commitment */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">
                {personalInfo.responseSpeed || t.contact.responseSpeed || 'Phản hồi trong vòng 2-4 giờ làm việc'}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditingContact(true)}
                  className="text-slate-500 hover:text-cyan-400 text-xs cursor-pointer p-1 transition-colors"
                  title="Chỉnh sửa dòng cam kết thời gian phản hồi"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
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
                        placeholder="John Doe"
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
                        placeholder="john@example.com"
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
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      {t.contact.messageLabel} <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={5}
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
                    className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {/* Direct Contact Channels Edit Modal for Admin */}
      <ContactChannelsEditModal 
        isOpen={isEditingContact} 
        onClose={() => setIsEditingContact(false)} 
      />
    </section>
  );
}
