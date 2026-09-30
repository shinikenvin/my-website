import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Shield, User, FolderGit2, BookOpen, MessageSquare, Lock, 
  Plus, Trash2, Edit3, Check, Upload, Image, Link, LogOut, KeyRound, 
  ExternalLink, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Camera,
  MessageCircle, Send
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, where, getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ChatMessage } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { usePortfolioData, ContactMessage } from '../context/PortfolioDataContext';
import { Project, BlogPost } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboardModal({ isOpen, onClose }: AdminDashboardModalProps) {
  const { user, logout, changePassword, resetPassword } = useAuth();
  const { 
    personalInfo, updatePersonalInfo, 
    projects, addProject, editProject, deleteProject,
    blogPosts, addBlogPost, editBlogPost, deleteBlogPost,
    messages, deleteMessage 
  } = usePortfolioData();

  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'blog' | 'messages' | 'livechat' | 'security'>('profile');

  // Live Chat state
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminSending, setAdminSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const q = query(collection(db, 'live_chat'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });
        setLiveChatMessages(list);
      }, (err) => {
        console.warn('Admin live chat listener error:', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Admin live chat error:', err);
    }
  }, [isOpen]);

  const conversations = useMemo(() => {
    const map = new Map<string, {
      conversationId: string;
      visitorName: string;
      visitorEmail: string;
      visitorAvatar: string;
      lastMessage: string;
      lastTime: string;
      messages: ChatMessage[];
    }>();

    liveChatMessages.forEach(msg => {
      const convId = msg.conversationId || msg.senderId;
      if (!convId) return;

      if (!map.has(convId)) {
        map.set(convId, {
          conversationId: convId,
          visitorName: msg.senderRole === 'visitor' ? msg.senderName : 'Khách truy cập',
          visitorEmail: msg.senderRole === 'visitor' ? msg.senderEmail : '',
          visitorAvatar: msg.senderRole === 'visitor' ? msg.senderAvatar : '🚀',
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          messages: [],
        });
      }

      const conv = map.get(convId)!;
      if (msg.senderRole === 'visitor' && msg.senderName) {
        conv.visitorName = msg.senderName;
        conv.visitorEmail = msg.senderEmail;
        conv.visitorAvatar = msg.senderAvatar;
      }
      conv.lastMessage = msg.text;
      conv.lastTime = msg.createdAt;
      conv.messages.push(msg);
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
  }, [liveChatMessages]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].conversationId);
    }
  }, [conversations, selectedConversationId]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedConversationId || adminSending) return;

    setAdminSending(true);
    try {
      await addDoc(collection(db, 'live_chat'), {
        conversationId: selectedConversationId,
        senderId: 'admin',
        senderName: 'Shinikenvin (Admin)',
        senderEmail: personalInfo.email,
        senderAvatar: personalInfo.avatarUrl || '👨‍💻',
        senderRole: 'admin',
        text: adminReplyText.trim(),
        createdAt: new Date().toISOString(),
        readByAdmin: true,
        readByVisitor: false,
      });
      setAdminReplyText('');
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setAdminSending(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;
    try {
      const q = query(collection(db, 'live_chat'), where('conversationId', '==', convId));
      const snaps = await getDocs(q);
      const promises = snaps.docs.map(d => deleteDoc(doc(db, 'live_chat', d.id)));
      await Promise.all(promises);
      if (selectedConversationId === convId) {
        setSelectedConversationId(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: personalInfo.name,
    role: personalInfo.role,
    email: personalInfo.email,
    location: personalInfo.location,
    status: personalInfo.status,
    website: personalInfo.website,
    avatarUrl: personalInfo.avatarUrl || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP,...)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileForm((prev) => ({ ...prev, avatarUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Project Form State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'devtools' as 'devtools' | 'web' | 'ai-cloud',
    categoryLabel: 'DevOps & Automation',
    year: '2026',
    description: '',
    longDescription: '',
    tags: 'React, TypeScript, CI/CD',
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
  });

  // Blog Form State
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'DevOps & CI/CD',
    summary: '',
    content: '',
    tags: 'GitHub Actions, CI/CD, DevOps',
    readTime: '4 phút',
  });

  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePersonalInfo({
      ...profileForm,
      avatarUrl: profileForm.avatarUrl.trim() || null,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Handle Project Submit
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = projectForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const categoryLabels: Record<string, string> = {
      'devtools': 'DevOps & Automation',
      'web': 'Web Application',
      'ai-cloud': 'Cloud Architecture',
    };

    if (editingProjectId) {
      await editProject(editingProjectId, {
        title: projectForm.title,
        subtitle: projectForm.description,
        category: projectForm.category,
        categoryLabel: categoryLabels[projectForm.category] || 'Software',
        year: projectForm.year,
        description: projectForm.description,
        fullCaseStudy: {
          overview: projectForm.longDescription || projectForm.description,
          challenge: 'Tối ưu hóa hiệu năng, giảm thiểu độ trễ và đảm bảo tính khả dụng cao.',
          solution: 'Ứng dụng kiến trúc phân tán, pipeline CI/CD tự động và tối ưu tài nguyên tĩnh.',
          architecture: ['React 19 Frontend', 'Vite Bundler', 'GitHub Actions CI/CD', 'GitHub Pages CDN'],
          keyFeatures: ['Tự động kiểm thử', 'Đóng gói tối ưu', 'Triển khai không gián đoạn'],
          metrics: [
            { label: 'Uptime', value: '99.9%' },
            { label: 'Build Time', value: '42s' },
          ],
        },
        tags: tagsArray,
        demoUrl: projectForm.demoUrl,
        githubUrl: projectForm.githubUrl,
      });
    } else {
      await addProject({
        title: projectForm.title,
        subtitle: projectForm.description,
        category: projectForm.category,
        categoryLabel: categoryLabels[projectForm.category] || 'Software',
        year: projectForm.year,
        description: projectForm.description,
        fullCaseStudy: {
          overview: projectForm.longDescription || projectForm.description,
          challenge: 'Tối ưu hóa hiệu năng, giảm thiểu độ trễ và đảm bảo tính khả dụng cao.',
          solution: 'Ứng dụng kiến trúc phân tán, pipeline CI/CD tự động và tối ưu tài nguyên tĩnh.',
          architecture: ['React 19 Frontend', 'Vite Bundler', 'GitHub Actions CI/CD', 'GitHub Pages CDN'],
          keyFeatures: ['Tự động kiểm thử', 'Đóng gói tối ưu', 'Triển khai không gián đoạn'],
          metrics: [
            { label: 'Uptime', value: '99.9%' },
            { label: 'Build Time', value: '42s' },
          ],
        },
        tags: tagsArray,
        demoUrl: projectForm.demoUrl,
        githubUrl: projectForm.githubUrl,
      });
    }

    setIsEditingProject(false);
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      category: 'devtools',
      categoryLabel: 'DevOps & Automation',
      year: '2026',
      description: '',
      longDescription: '',
      tags: 'React, TypeScript, CI/CD',
      demoUrl: 'https://shinikenvin.github.io/my-website/',
      githubUrl: 'https://github.com/shinikenvin/my-website',
    });
  };

  const handleStartEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      category: p.category as any,
      categoryLabel: p.categoryLabel,
      year: p.year,
      description: p.description,
      longDescription: p.fullCaseStudy?.overview || p.description,
      tags: p.tags.join(', '),
      demoUrl: p.demoUrl,
      githubUrl: p.githubUrl,
    });
    setIsEditingProject(true);
  };

  // Handle Blog Submit
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const today = new Date().toISOString().split('T')[0];
    const slug = blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blogContent = {
      introduction: blogForm.summary,
      sections: [
        {
          heading: 'Phân tích chi tiết',
          body: blogForm.content,
        },
      ],
      conclusion: 'Bài viết tổng hợp góc nhìn thực chiến từ quá trình phát triển dự án.',
    };

    if (editingBlogId) {
      await editBlogPost(editingBlogId, {
        title: blogForm.title,
        slug,
        category: blogForm.category,
        summary: blogForm.summary,
        content: blogContent,
        tags: tagsArray,
        readTime: blogForm.readTime,
      });
    } else {
      await addBlogPost({
        title: blogForm.title,
        slug,
        category: blogForm.category,
        summary: blogForm.summary,
        content: blogContent,
        date: today,
        readTime: blogForm.readTime,
        tags: tagsArray,
        likes: 12,
      });
    }

    setIsEditingBlog(false);
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      category: 'DevOps & CI/CD',
      summary: '',
      content: '',
      tags: 'GitHub Actions, CI/CD, DevOps',
      readTime: '4 phút',
    });
  };

  const handleStartEditBlog = (b: BlogPost) => {
    setEditingBlogId(b.id);
    setBlogForm({
      title: b.title,
      category: b.category,
      summary: b.summary,
      content: typeof b.content === 'string' ? b.content : b.content?.sections?.[0]?.body || b.content?.introduction || '',
      tags: b.tags.join(', '),
      readTime: b.readTime,
    });
    setIsEditingBlog(true);
  };

  // Handle Password Change
  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setSecurityLoading(true);
    try {
      await changePassword(newPassword);
      if (typeof window !== 'undefined' && localStorage.getItem('admin_remember_password') !== 'false') {
        localStorage.setItem('admin_saved_password', newPassword);
      }
      setSecurityMsg({ type: 'success', text: 'Đổi mật khẩu Admin thành công!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Lỗi khi đổi mật khẩu.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle Send Reset Email from Security Tab
  const handleSendResetEmail = async () => {
    setSecurityMsg(null);
    try {
      if (user?.email) {
        const result = await resetPassword(user.email);
        setSecurityMsg({ 
          type: 'success', 
          text: `Mã xác thực bảo mật khôi phục mật khẩu đã được tạo: ${result.code} (Gửi đến ${result.email})!` 
        });
      }
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Lỗi gửi email đặt lại mật khẩu.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {profileForm.avatarUrl ? (
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-900 shrink-0 shadow-lg">
                <img src={profileForm.avatarUrl} alt="Admin Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Bảng Quản Trị Hệ Thống (CMS)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Admin: {user?.email}
                </span>
              </div>
              <p className="text-xs text-slate-400">Quản lý và đổi ảnh đại diện, dự án, bài viết trên website</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ & Ảnh đại diện</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Quản lý Dự án ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blog')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'blog'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý Blog ({blogPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tin nhắn ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('livechat')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'livechat'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Live Chat ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Đổi mật khẩu & Bảo mật</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Profile & Avatar */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã cập nhật thông tin hồ sơ và ảnh đại diện lên website thành công!</span>
                </div>
              )}

              {/* Avatar section */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-cyan-900/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Ảnh đại diện hiển thị trên trang chủ</span>
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
                    Chỉ quản trị viên mới có quyền đổi
                  </span>
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Clickable Avatar Preview with hover camera badge */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-900 flex items-center justify-center shrink-0 shadow-xl cursor-pointer hover:border-cyan-300 transition-all"
                    title="Bấm để tải ảnh mới từ máy tính / điện thoại"
                  >
                    {profileForm.avatarUrl ? (
                      <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                    ) : (
                      <User className="w-12 h-12 text-slate-500 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-medium gap-1">
                      <Camera className="w-5 h-5 text-cyan-300" />
                      <span>Đổi ảnh</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy tính / điện thoại</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatarUrl: 'https://github.com/shinikenvin.png' })}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-750 text-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/80"
                      >
                        <Image className="w-3.5 h-3.5" />
                        <span>Dùng ảnh GitHub (shinikenvin.png)</span>
                      </button>

                      {profileForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, avatarUrl: '' })}
                          className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Đặt lại ảnh minh họa</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Link className="w-3 h-3 text-slate-500" />
                        <span>Hoặc dán trực tiếp đường dẫn URL hình ảnh:</span>
                      </label>
                      <input
                        type="text"
                        value={profileForm.avatarUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                        placeholder="https://example.com/my-photo.jpg"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Tên hiển thị</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Chức danh / Role</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email liên hệ</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Địa điểm</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Trạng thái làm việc</label>
                  <input
                    type="text"
                    value={profileForm.status}
                    onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Địa chỉ Website chính thức</label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi Hồ Sơ</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Projects CMS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {!isEditingProject ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Danh Sách Dự Án Thực Tế</h3>
                      <p className="text-xs text-slate-400">Bạn có thể thêm dự án mới hoặc sửa/xóa các dự án hiện có</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProjectId(null);
                        setProjectForm({
                          title: '',
                          category: 'devtools',
                          categoryLabel: 'DevOps & Automation',
                          year: '2026',
                          description: '',
                          longDescription: '',
                          tags: 'React, TypeScript, CI/CD',
                          demoUrl: 'https://shinikenvin.github.io/my-website/',
                          githubUrl: 'https://github.com/shinikenvin/my-website',
                        });
                        setIsEditingProject(true);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Dự Án Mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-cyan-400">{proj.categoryLabel}</span>
                            <span className="text-slate-500">{proj.year}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                          <p className="text-xs text-slate-300 line-clamp-2">{proj.description}</p>
                          <div className="text-[10px] font-mono text-slate-400 pt-1">
                            {proj.tags.join(' · ')}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => handleStartEditProject(proj)}
                            className="p-1.5 text-xs text-cyan-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa dự án "${proj.title}"?`)) {
                                deleteProject(proj.id);
                              }
                            }}
                            className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProject} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">
                      {editingProjectId ? 'Chỉnh Sửa Dự Án' : 'Thêm Dự Án Mới'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingProject(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Tên dự án</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="Vd: Automated CI/CD Platform"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Danh mục</label>
                      <select
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="devtools">DevOps & CI/CD (devtools)</option>
                        <option value="web">Web Application (web)</option>
                        <option value="ai-cloud">Cloud & Telemetry (ai-cloud)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Năm thực hiện</label>
                      <input
                        type="text"
                        value={projectForm.year}
                        onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Công nghệ (Cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={projectForm.tags}
                        onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                        placeholder="React, TypeScript, Tailwind, Docker"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Link Live Demo</label>
                      <input
                        type="url"
                        value={projectForm.demoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Link GitHub Repository</label>
                      <input
                        type="url"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Mô tả tóm tắt</label>
                    <textarea
                      rows={2}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Mô tả ngắn gọn về dự án..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Chi tiết kiến trúc chuyên sâu</label>
                    <textarea
                      rows={4}
                      value={projectForm.longDescription}
                      onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                      placeholder="Phân tích chi tiết về kiến trúc, thách thức kỹ thuật và giải pháp..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProject(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md"
                    >
                      {editingProjectId ? 'Cập Nhật Dự Án' : 'Thêm Mới Dự Án'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Blog Posts CMS */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              {!isEditingBlog ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Danh Sách Bài Viết Kỹ Thuật</h3>
                      <p className="text-xs text-slate-400">Quản lý các bài viết trên trang blog cá nhân</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBlogId(null);
                        setBlogForm({
                          title: '',
                          category: 'DevOps & CI/CD',
                          summary: '',
                          content: '',
                          tags: 'GitHub Actions, CI/CD, DevOps',
                          readTime: '4 phút',
                        });
                        setIsEditingBlog(true);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Bài Viết Mới</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="text-cyan-400">{post.category}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{post.date}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{post.readTime}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{post.title}</h4>
                          <p className="text-xs text-slate-300 line-clamp-1">{post.summary}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleStartEditBlog(post)}
                            className="p-1.5 text-xs text-cyan-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bài viết "${post.title}"?`)) {
                                deleteBlogPost(post.id);
                              }
                            }}
                            className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveBlog} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">
                      {editingBlogId ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingBlog(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Tiêu đề bài viết</label>
                      <input
                        type="text"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        placeholder="Tiêu đề bài viết..."
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Chủ đề</label>
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                        <option value="Frontend & UI">Frontend & UI</option>
                        <option value="Kiến trúc & Design">Kiến trúc & Design</option>
                        <option value="Hiệu năng & Tối ưu">Hiệu năng & Tối ưu</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Thẻ tag (cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        placeholder="React, CSS, Architecture"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Thời gian đọc ước tính</label>
                      <input
                        type="text"
                        value={blogForm.readTime}
                        onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        placeholder="Vd: 5 phút"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Tóm tắt nội dung</label>
                    <textarea
                      rows={2}
                      value={blogForm.summary}
                      onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                      placeholder="Tóm tắt ngắn hiển thị trên thẻ bài viết..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Nội dung chi tiết bài viết</label>
                    <textarea
                      rows={6}
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="Viết nội dung bài viết kỹ thuật ở đây..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBlog(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md"
                    >
                      {editingBlogId ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: Messages Inbox */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Tin Nhắn Từ Khách Xem Website</h3>
                <p className="text-xs text-slate-400">Các tin nhắn được gửi qua biểu mẫu liên hệ tại mục "Liên hệ trực tiếp"</p>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                  Chưa có tin nhắn nào từ khách truy cập.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{msg.name}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">({msg.email})</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Xóa tin nhắn này?')) {
                              deleteMessage(msg.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 font-mono">
                        Chủ đề: {msg.subject}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LIVE CHAT */}
          {activeTab === 'livechat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Hộp Thư Live Chat Trực Tuyến Với Khách</span>
                  </h3>
                  <p className="text-xs text-slate-400">Xem và phản hồi trực tiếp các tin nhắn từ khách ghé thăm website theo thời gian thực</p>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{conversations.length} cuộc trò chuyện</span>
                </span>
              </div>

              {conversations.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs space-y-2">
                  <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Chưa có cuộc trò chuyện nào từ khách truy cập.</p>
                  <p className="text-[11px] text-slate-500">Khi người dùng nhấn chat ở góc phải màn hình và gửi tin, tin nhắn sẽ xuất hiện tại đây ngay tức thì.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[480px] bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                  
                  {/* Left Column: Conversations List */}
                  <div className="md:col-span-5 border-r border-slate-800 flex flex-col h-full bg-slate-950/60 overflow-y-auto">
                    <div className="p-3 border-b border-slate-800 text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                      Danh sách khách đang trò chuyện ({conversations.length})
                    </div>
                    <div className="divide-y divide-slate-800/60 flex-1 overflow-y-auto">
                      {conversations.map((conv) => {
                        const isSelected = selectedConversationId === conv.conversationId;
                        return (
                          <div
                            key={conv.conversationId}
                            onClick={() => setSelectedConversationId(conv.conversationId)}
                            className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                              isSelected
                                ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                                : 'hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-slate-900 border border-cyan-700/80 flex items-center justify-center text-lg shrink-0">
                              {conv.visitorAvatar || '🚀'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-white truncate">{conv.visitorName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-cyan-400/90 font-mono truncate">{conv.visitorEmail}</p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Chat History & Admin Reply Input */}
                  <div className="md:col-span-7 flex flex-col h-full bg-slate-900/40">
                    {selectedConversationId && (
                      (() => {
                        const activeConv = conversations.find(c => c.conversationId === selectedConversationId);
                        if (!activeConv) return null;
                        return (
                          <>
                            {/* Thread header */}
                            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{activeConv.visitorAvatar}</span>
                                <div>
                                  <h4 className="text-xs font-bold text-white">{activeConv.visitorName}</h4>
                                  <p className="text-[10px] font-mono text-cyan-400">{activeConv.visitorEmail}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteConversation(activeConv.conversationId)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                                title="Xóa đoạn chat này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>

                            {/* Thread messages */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                              {activeConv.messages.map((m) => {
                                const isAdminMsg = m.senderRole === 'admin';
                                return (
                                  <div
                                    key={m.id}
                                    className={`flex gap-2.5 ${isAdminMsg ? 'flex-row-reverse' : 'flex-row'} items-end`}
                                  >
                                    <div className="text-base shrink-0">
                                      {isAdminMsg ? '👨‍💻' : (m.senderAvatar || '🚀')}
                                    </div>
                                    <div className={`max-w-[80%] space-y-1 ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                                      <div className="text-[10px] text-slate-500 px-1 font-mono">
                                        {isAdminMsg ? 'Bạn (Admin)' : m.senderName} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                                        isAdminMsg
                                          ? 'bg-emerald-600 text-white rounded-br-sm'
                                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-sm'
                                      }`}>
                                        {m.text}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Thread reply input */}
                            <form onSubmit={handleSendAdminReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                              <input
                                type="text"
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder={`Trả lời ${activeConv.visitorName} với tư cách Admin...`}
                                className="flex-1 py-2 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                              <button
                                type="submit"
                                disabled={!adminReplyText.trim() || adminSending}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Gửi</span>
                              </button>
                            </form>
                          </>
                        );
                      })()
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 5: Security & Password */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-sm font-bold text-white">Bảo Mật Tài Khoản & Mật Khẩu Admin</h3>
                <p className="text-xs text-slate-400">Thay đổi mật khẩu đăng nhập hoặc nhận link đặt lại mật khẩu qua email</p>
              </div>

              {securityMsg && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}>
                  {securityMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{securityMsg.text}</span>
                </div>
              )}

              {/* Direct Change Password Form */}
              <form onSubmit={handleChangePass} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Đổi Mật Khẩu Trực Tiếp</span>
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Mật khẩu mới (ít nhất 6 ký tự)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={securityLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
                >
                  {securityLoading ? 'Đang cập nhật mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
                </button>
              </form>

              {/* Forgot / Reset password by email */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Gửi Link Đặt Lại Mật Khẩu Qua Email</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nếu bạn muốn nhận email hướng dẫn đặt lại mật khẩu của Google Firebase gửi thẳng về địa chỉ email của bạn (<strong className="text-white font-mono">{user?.email}</strong>):
                </p>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <span>Gửi email khôi phục mật khẩu ngay</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
