import React, { useState, useEffect } from 'react';
import { usePortfolioData, ContactChannelItem } from '../context/PortfolioDataContext';
import { 
  X, Mail, Github, Globe, Phone, Send, Linkedin, 
  Plus, Trash2, Save, MessageSquare, Clock 
} from 'lucide-react';

interface ContactChannelsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactChannelsEditModal({ isOpen, onClose }: ContactChannelsEditModalProps) {
  const { personalInfo, updatePersonalInfo } = usePortfolioData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [websiteLabel, setWebsiteLabel] = useState('GitHub Pages Hosting');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [responseSpeed, setResponseSpeed] = useState('Phản hồi trong vòng 2-4 giờ làm việc');
  const [additionalChannels, setAdditionalChannels] = useState<ContactChannelItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEmail(personalInfo.email || '');
      setGithub(personalInfo.github || '');
      setWebsite(personalInfo.website || '');
      setWebsiteLabel(personalInfo.websiteLabel || 'GitHub Pages Hosting');
      setPhone(personalInfo.phone || '');
      setTelegram(personalInfo.telegram || '');
      setLinkedin(personalInfo.linkedin || '');
      setResponseSpeed(personalInfo.responseSpeed || 'Phản hồi trong vòng 2-4 giờ làm việc');
      setAdditionalChannels(
        personalInfo.additionalChannels ? JSON.parse(JSON.stringify(personalInfo.additionalChannels)) : []
      );
      setError(null);
    }
  }, [isOpen, personalInfo]);

  if (!isOpen) return null;

  const handleAddChannel = () => {
    setAdditionalChannels([
      ...additionalChannels,
      {
        id: `channel-${Date.now()}`,
        label: 'Kênh liên hệ mới',
        value: '',
        url: '',
        type: 'link'
      }
    ]);
  };

  const handleChannelChange = (idx: number, field: keyof ContactChannelItem, val: string) => {
    const updated = [...additionalChannels];
    updated[idx] = { ...updated[idx], [field]: val };
    setAdditionalChannels(updated);
  };

  const handleRemoveChannel = (idx: number) => {
    setAdditionalChannels(additionalChannels.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email không được để trống.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePersonalInfo({
        email: email.trim(),
        github: github.trim(),
        website: website.trim(),
        websiteLabel: websiteLabel.trim() || 'GitHub Pages Hosting',
        phone: phone.trim(),
        telegram: telegram.trim(),
        linkedin: linkedin.trim(),
        responseSpeed: responseSpeed.trim() || 'Phản hồi trong vòng 2-4 giờ làm việc',
        additionalChannels: additionalChannels.filter(c => c.value.trim() !== '' || (c.url && c.url.trim() !== ''))
      });
      onClose();
    } catch (err: any) {
      console.error('Error updating contact channels:', err);
      setError(err.message || 'Lỗi khi lưu thông tin kênh liên hệ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Chỉnh Sửa Kênh Liên Hệ Trực Tiếp
              </h3>
              <p className="text-xs text-slate-400">Tùy biến Email, GitHub, Website, Điện thoại, Telegram & Thời gian phản hồi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email liên hệ chính *</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: shinikenvin@gmail.com"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          {/* GitHub Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-300" />
              <span>GitHub Profile URL</span>
            </label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/shinikenvin"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Website Hosting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nhãn hiển thị Website</span>
              </label>
              <input
                type="text"
                value={websiteLabel}
                onChange={(e) => setWebsiteLabel(e.target.value)}
                placeholder="GitHub Pages Hosting"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Đường dẫn Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://shinikenvin.github.io/my-website/"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Optional Direct Channels: Phone & Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Số điện thoại / Zalo (Tùy chọn)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 9xx xxx xxx"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram (Tùy chọn)</span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username hoặc link t.me/..."
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* LinkedIn (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn Profile (Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/shinikenvin"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Response Speed Note */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Dòng cam kết thời gian phản hồi</span>
            </label>
            <input
              type="text"
              value={responseSpeed}
              onChange={(e) => setResponseSpeed(e.target.value)}
              placeholder="Phản hồi trong vòng 2-4 giờ làm việc"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Additional Custom Channels */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Kênh liên kết tùy chỉnh khác</span>
              <button
                type="button"
                onClick={handleAddChannel}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm kênh</span>
              </button>
            </div>

            {additionalChannels.map((ch, idx) => (
              <div key={ch.id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  value={ch.label}
                  onChange={(e) => handleChannelChange(idx, 'label', e.target.value)}
                  placeholder="Nhãn (VD: Discord, Zalo)"
                  className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
                <input
                  type="text"
                  value={ch.value}
                  onChange={(e) => {
                    handleChannelChange(idx, 'value', e.target.value);
                    if (!ch.url) handleChannelChange(idx, 'url', e.target.value);
                  }}
                  placeholder="Giá trị hoặc liên kết"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChannel(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Xóa kênh này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Kênh Liên Hệ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
