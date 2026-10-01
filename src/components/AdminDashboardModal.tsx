import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Shield, User, FolderGit2, BookOpen, MessageSquare, Lock, 
  Plus, Trash2, Edit3, Check, Upload, Image, Link, LogOut, KeyRound, 
  ExternalLink, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Camera,
  MessageCircle, Send, Briefcase, Calendar, MapPin, Building2, Users, Globe
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, where, getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ChatMessage, CommunityMessage } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import { usePortfolioData, ContactMessage } from '../context/PortfolioDataContext';
import { Project, BlogPost, ExperienceItem } from '../types';

export type AdminTabType = 'profile' | 'experience' | 'messages' | 'livechat' | 'security';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdminTabType;
  targetExperienceId?: string | null;
}

export function AdminDashboardModal({ 
  isOpen, 
  onClose, 
  initialTab = 'profile',
  targetExperienceId = null,
}: AdminDashboardModalProps) {
  const { user, logout, changePassword, resetPassword } = useAuth();
  const { 
    personalInfo, updatePersonalInfo, 
    projects, addProject, editProject, deleteProject,
    blogPosts, addBlogPost, editBlogPost, deleteBlogPost,
    experiences, addExperience, editExperience, deleteExperience, resetExperiencesToDefault,
    messages, deleteMessage 
  } = usePortfolioData();

  const [activeTab, setActiveTab] = useState<AdminTabType>(initialTab);

  // Live Chat state - Direct 1-1 with visitors
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminSending, setAdminSending] = useState(false);

  // Live Chat state - Community Channel
  const [chatChannelMode, setChatChannelMode] = useState<'direct' | 'community'>('direct');
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [adminCommunityReplyText, setAdminCommunityReplyText] = useState('');
  const [adminCommunitySending, setAdminCommunitySending] = useState(false);

  // Scroll anchor refs
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const adminCommunityEndRef = useRef<HTMLDivElement>(null);

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

  // Listener for Community Chat
  useEffect(() => {
    if (!isOpen) return;
    try {
      const q = query(collection(db, 'community_chat'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: CommunityMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CommunityMessage);
        });
        setCommunityMessages(list);
      }, (err) => {
        console.warn('Admin community chat listener error:', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Admin community chat error:', err);
    }
  }, [isOpen]);

  // Auto-scroll on message updates
  useEffect(() => {
    if (activeTab === 'livechat' && chatChannelMode === 'direct' && selectedConversationId) {
      adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, chatChannelMode, selectedConversationId, liveChatMessages]);

  useEffect(() => {
    if (activeTab === 'livechat' && chatChannelMode === 'community') {
      adminCommunityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, chatChannelMode, communityMessages]);

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

  const handleSendAdminCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCommunityReplyText.trim() || adminCommunitySending) return;

    setAdminCommunitySending(true);
    try {
      await addDoc(collection(db, 'community_chat'), {
        senderId: 'admin',
        senderName: 'Shinikenvin (Admin)',
        senderEmail: personalInfo.email,
        senderAvatar: personalInfo.avatarUrl || '👨‍💻',
        senderRole: 'admin',
        text: adminCommunityReplyText.trim(),
        createdAt: new Date().toISOString(),
      });
      setAdminCommunityReplyText('');
    } catch (err) {
      console.error('Failed to send admin community message:', err);
    } finally {
      setAdminCommunitySending(false);
    }
  };

  const handleDeleteCommunityMessage = async (msgId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa tin nhắn cộng đồng',
      message: 'Bạn có chắc chắn muốn xóa tin nhắn này khỏi kênh trò chuyện cộng đồng không?',
      action: async () => {
        try {
          await deleteDoc(doc(db, 'community_chat', msgId));
        } catch (err) {
          console.error('Failed to delete community message:', err);
        }
      },
    });
  };

  // Custom confirmation modal state to avoid iframe security errors with window.confirm
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void | Promise<void>;
  } | null>(null);

  const handleDeleteConversation = (convId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa đoạn hội thoại',
      message: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện này không?',
      action: async () => {
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
      }
    });
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
    heroHeadline: personalInfo.heroHeadline || 'Kiến tạo trải nghiệm số,\nvới hiệu năng đỉnh cao\n& tư duy sản phẩm chuyên sâu.',
    bio: personalInfo.bio || 'Chào bạn, tôi là Shinikenvin, một Full-Stack Software Engineer & Creative Developer. Tôi chuyên xây dựng các ứng dụng web hiện đại, kiến trúc đám mây ổn định, quy trình CI/CD tự động và giao diện người dùng đạt chuẩn quốc tế.',
  });

  useEffect(() => {
    setProfileForm({
      name: personalInfo.name,
      role: personalInfo.role,
      email: personalInfo.email,
      location: personalInfo.location,
      status: personalInfo.status,
      website: personalInfo.website,
      avatarUrl: personalInfo.avatarUrl || '',
      heroHeadline: personalInfo.heroHeadline || 'Kiến tạo trải nghiệm số,\nvới hiệu năng đỉnh cao\n& tư duy sản phẩm chuyên sâu.',
      bio: personalInfo.bio || 'Chào bạn, tôi là Shinikenvin, một Full-Stack Software Engineer & Creative Developer. Tôi chuyên xây dựng các ứng dụng web hiện đại, kiến trúc đám mây ổn định, quy trình CI/CD tự động và giao diện người dùng đạt chuẩn quốc tế.',
    });
  }, [personalInfo]);

  const [profileSaved, setProfileSaved] = useState(false);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileUploadError('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP,...)');
      setTimeout(() => setProfileUploadError(null), 4000);
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

  // Experience Form State
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    description: '',
    highlights: '',
    skills: '',
    order: 1,
  });
  const [experienceNotice, setExperienceNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [experienceLoading, setExperienceLoading] = useState(false);

  // Sync initial tab & target experience when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && targetExperienceId && experiences.length > 0) {
      const exp = experiences.find(e => e.id === targetExperienceId);
      if (exp) {
        setActiveTab('experience');
        setEditingExperienceId(exp.id || null);
        setExperienceForm({
          company: exp.company,
          role: exp.role,
          period: exp.period,
          location: exp.location,
          description: exp.description,
          highlights: (exp.highlights || []).join('\n'),
          skills: (exp.skills || []).join(', '),
          order: exp.order ?? 1,
        });
        setIsEditingExperience(true);
      }
    }
  }, [isOpen, targetExperienceId, experiences]);

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

  // Experience Action Handlers
  const handleStartAddExperience = () => {
    setEditingExperienceId(null);
    setExperienceForm({
      company: '',
      role: '',
      period: '2026 — Hiện tại',
      location: 'Việt Nam & Remote',
      description: '',
      highlights: 'Dẫn dắt phát triển hệ thống web phân tán\nTối ưu hóa hiệu năng và pipeline CI/CD',
      skills: 'React, TypeScript, Tailwind CSS, Docker',
      order: (experiences.length > 0 ? Math.max(...experiences.map(e => e.order || 0)) : 0) + 1,
    });
    setIsEditingExperience(true);
    setExperienceNotice(null);
  };

  const handleStartEditExperience = (exp: ExperienceItem) => {
    setEditingExperienceId(exp.id || null);
    setExperienceForm({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      location: exp.location,
      description: exp.description,
      highlights: (exp.highlights || []).join('\n'),
      skills: (exp.skills || []).join(', '),
      order: exp.order ?? 1,
    });
    setIsEditingExperience(true);
    setExperienceNotice(null);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setExperienceLoading(true);
    setExperienceNotice(null);
    try {
      const highlightsArray = experienceForm.highlights
        .split('\n')
        .map(h => h.trim().replace(/^[•\-\*▸\s]+/, ''))
        .filter(Boolean);

      const skillsArray = experienceForm.skills
        .split(/[,·]/)
        .map(s => s.trim())
        .filter(Boolean);

      const payload: Omit<ExperienceItem, 'id'> = {
        company: experienceForm.company.trim(),
        role: experienceForm.role.trim(),
        period: experienceForm.period.trim(),
        location: experienceForm.location.trim(),
        description: experienceForm.description.trim(),
        highlights: highlightsArray.length > 0 ? highlightsArray : ['Đóng góp phát triển và tối ưu ứng dụng'],
        skills: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript'],
        order: Number(experienceForm.order) || 1,
      };

      if (editingExperienceId) {
        await editExperience(editingExperienceId, payload);
        setExperienceNotice({
          type: 'success',
          text: `Đã cập nhật mục kinh nghiệm "${payload.role} tại ${payload.company}" thành công!`
        });
      } else {
        await addExperience(payload);
        setExperienceNotice({
          type: 'success',
          text: `Đã thêm mục kinh nghiệm "${payload.role} tại ${payload.company}" thành công!`
        });
      }

      setIsEditingExperience(false);
      setEditingExperienceId(null);
      setTimeout(() => setExperienceNotice(null), 4000);
    } catch (err: any) {
      setExperienceNotice({
        type: 'error',
        text: `Lỗi khi lưu kinh nghiệm: ${err.message || 'Vui lòng thử lại'}`
      });
    } finally {
      setExperienceLoading(false);
    }
  };

  const handleDeleteExperience = (exp: ExperienceItem) => {
    if (!exp.id) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa mục kinh nghiệm',
      message: `Bạn có chắc muốn xóa mục kinh nghiệm "${exp.role} tại ${exp.company}" không?`,
      action: async () => {
        try {
          await deleteExperience(exp.id!);
          setExperienceNotice({
            type: 'success',
            text: `Đã xóa mục kinh nghiệm "${exp.role}".`
          });
          setTimeout(() => setExperienceNotice(null), 3000);
        } catch (err: any) {
          setExperienceNotice({
            type: 'error',
            text: `Lỗi khi xóa: ${err.message}`
          });
        }
      }
    });
  };

  const handleResetExperiences = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Khôi phục kinh nghiệm mặc định',
      message: 'Khôi phục danh sách lộ trình kinh nghiệm về 3 mục chuẩn ban đầu?',
      action: async () => {
        try {
          await resetExperiencesToDefault();
          setExperienceNotice({
            type: 'success',
            text: 'Đã khôi phục danh sách kinh nghiệm chuẩn thành công!'
          });
          setTimeout(() => setExperienceNotice(null), 3000);
        } catch (err: any) {
          setExperienceNotice({
            type: 'error',
            text: `Lỗi khôi phục: ${err.message}`
          });
        }
      }
    });
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
            onClick={() => setActiveTab('experience')}
            className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Kinh nghiệm & Kỹ năng ({experiences.length})</span>
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

              {profileUploadError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{profileUploadError}</span>
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

                {/* Hero Headline (Tiêu đề hiển thị đầu trang) */}
                <div className="space-y-1.5 sm:col-span-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tiêu đề hiển thị đầu trang (Hero Headline)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Xuống dòng để tạo hiệu ứng phân cấp</span>
                  </div>
                  <textarea
                    rows={3}
                    value={profileForm.heroHeadline}
                    onChange={(e) => setProfileForm({ ...profileForm, heroHeadline: e.target.value })}
                    placeholder="VD: Kiến tạo trải nghiệm số,&#10;với hiệu năng đỉnh cao&#10;& tư duy sản phẩm chuyên sâu."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Bio / Nội dung đoạn văn giới thiệu bản thân */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Nội dung đoạn văn giới thiệu bản thân (Bio / Lời chào & Định vị)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="VD: Chào bạn, tôi là Shinikenvin, một Full-Stack Software Engineer & Creative Developer. Tôi chuyên xây dựng các ứng dụng web hiện đại, kiến trúc đám mây ổn định, quy trình CI/CD tự động và giao diện người dùng đạt chuẩn quốc tế."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Đoạn văn này sẽ hiển thị trang trọng tại phần mở đầu trang chủ (ngay dưới tiêu đề chính).
                  </p>
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
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Xóa bài viết',
                                message: `Bạn có chắc muốn xóa bài viết "${post.title}" không?`,
                                action: () => deleteBlogPost(post.id)
                              });
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

          {/* TAB 4: Experience & Career Timeline */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span>Quản Lý Lộ Trình Kinh Nghiệm & Kỹ Năng</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chỉnh sửa các vị trí công tác, thời gian, mô tả và thành tựu hiển thị trên mục "03. Kinh nghiệm làm việc"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetExperiences}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Khôi phục danh sách chuẩn mặc định"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Khôi phục mặc định</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartAddExperience}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/50 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm kinh nghiệm mới</span>
                  </button>
                </div>
              </div>

              {experienceNotice && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  experienceNotice.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                }`}>
                  {experienceNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{experienceNotice.text}</span>
                </div>
              )}

              {/* Form or List View */}
              {isEditingExperience ? (
                <form onSubmit={handleSaveExperience} className="p-5 rounded-2xl bg-slate-950/70 border border-cyan-900/50 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-cyan-400" />
                      <span>{editingExperienceId ? 'Chỉnh Sửa Mục Kinh Nghiệm' : 'Thêm Mục Kinh Nghiệm Mới'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingExperience(false);
                        setEditingExperienceId(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        <span>Chức danh / Vị trí đảm nhiệm</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={experienceForm.role}
                        onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                        placeholder="Vd: Senior Full-Stack Engineer / Team Lead"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        <span>Tên công ty / Tổ chức</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                        placeholder="Vd: TechCraft Solutions"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        <span>Khoảng thời gian công tác</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={experienceForm.period}
                        onChange={(e) => setExperienceForm({ ...experienceForm, period: e.target.value })}
                        placeholder="Vd: 2024 — Hiện tại hoặc 2022 — 2024"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        <span>Địa điểm / Hình thức</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                        placeholder="Vd: Việt Nam & Remote hoặc TP. Hồ Chí Minh"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                      <span>Mô tả tổng quan vai trò và đóng góp chính</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      placeholder="Dẫn dắt phát triển hệ thống web phân tán, thiết kế kiến trúc frontend quy mô lớn..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">
                        Các thành tựu & điểm nổi bật (Highlights)
                      </label>
                      <span className="text-[10px] text-slate-400">Mỗi dòng là một gạch đầu dòng ▸ trên giao diện</span>
                    </div>
                    <textarea
                      rows={4}
                      value={experienceForm.highlights}
                      onChange={(e) => setExperienceForm({ ...experienceForm, highlights: e.target.value })}
                      placeholder="Tái cấu trúc hệ thống frontend từ monolith sang micro-frontends, tăng tốc độ build 4.2 lần&#10;Xây dựng hệ thống CI/CD chuẩn hóa với GitHub Actions..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Kỹ năng & Công nghệ (cách nhau bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={experienceForm.skills}
                        onChange={(e) => setExperienceForm({ ...experienceForm, skills: e.target.value })}
                        placeholder="React, TypeScript, Tailwind CSS, Docker, GitHub Actions"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Thứ tự hiển thị (Order)</label>
                      <input
                        type="number"
                        value={experienceForm.order}
                        onChange={(e) => setExperienceForm({ ...experienceForm, order: Number(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingExperience(false);
                        setEditingExperienceId(null);
                      }}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={experienceLoading}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-cyan-950/40"
                    >
                      {experienceLoading ? 'Đang lưu...' : (editingExperienceId ? 'Cập Nhật Mục Kinh Nghiệm' : 'Thêm Mục Kinh Nghiệm')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {experiences.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                      Chưa có mục kinh nghiệm nào. Nhấn "Thêm kinh nghiệm mới" để bắt đầu.
                    </div>
                  ) : (
                    experiences.map((exp, index) => (
                      <div
                        key={exp.id || index}
                        className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-400 flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {exp.role}
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">·</span>
                            <span className="text-xs text-cyan-400 font-medium">
                              {exp.company}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              {exp.period}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {exp.location}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {exp.description}
                          </p>

                          {exp.highlights && exp.highlights.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {exp.highlights.slice(0, 2).map((h, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                  <span className="text-cyan-400">▸</span>
                                  <span className="line-clamp-1">{h}</span>
                                </div>
                              ))}
                              {exp.highlights.length > 2 && (
                                <span className="text-[10px] text-slate-500 italic">
                                  +{exp.highlights.length - 2} điểm nổi bật khác...
                                </span>
                              )}
                            </div>
                          )}

                          {exp.skills && exp.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {exp.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 md:self-start">
                          <button
                            type="button"
                            onClick={() => handleStartEditExperience(exp)}
                            className="px-3 py-1.5 text-xs text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-900/60 hover:border-cyan-500 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(exp)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Xóa mục kinh nghiệm này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Messages Inbox */}
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
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Xóa tin nhắn',
                              message: `Bạn có chắc chắn muốn xóa tin nhắn từ "${msg.name}" không?`,
                              action: () => deleteMessage(msg.id)
                            });
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Hộp Thư Live Chat & Cộng Đồng Trực Tuyến</span>
                  </h3>
                  <p className="text-xs text-slate-400">Xem và phản hồi trực tiếp các tin nhắn từ khách ghé thăm website theo thời gian thực</p>
                </div>

                {/* Sub-channel Switcher: Direct Chat vs Community Chat */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChatChannelMode('direct')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                      chatChannelMode === 'direct'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Riêng Khách ({conversations.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChatChannelMode('community')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                      chatChannelMode === 'community'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Kênh Cộng Đồng ({communityMessages.length})</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </button>
                </div>
              </div>

              {/* MODE 1: DIRECT 1-1 CHATS WITH VISITORS */}
              {chatChannelMode === 'direct' && (
                <>
                  {conversations.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs space-y-2">
                      <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                      <p>Chưa có cuộc trò chuyện riêng nào từ khách truy cập.</p>
                      <p className="text-[11px] text-slate-500">Khi người dùng nhấn chat ở góc phải màn hình và gửi tin riêng cho Admin, tin nhắn sẽ xuất hiện tại đây ngay tức thì.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[500px] min-h-0 bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                      
                      {/* Left Column: Conversations List */}
                      <div className="md:col-span-5 border-r border-slate-800 flex flex-col h-full min-h-0 bg-slate-950/60 overflow-hidden">
                        <div className="p-3 border-b border-slate-800 text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider shrink-0 bg-slate-900/50 flex items-center justify-between">
                          <span>Danh sách khách ({conversations.length})</span>
                          <span className="text-[10px] text-cyan-400">1-1 Riêng tư</span>
                        </div>
                        <div className="divide-y divide-slate-800/60 flex-1 min-h-0 overflow-y-auto">
                          {conversations.map((conv) => {
                            const isSelected = selectedConversationId === conv.conversationId;
                            return (
                              <div
                                key={conv.conversationId}
                                onClick={() => setSelectedConversationId(conv.conversationId)}
                                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                                  isSelected
                                    ? 'bg-cyan-950/50 border-l-4 border-cyan-400'
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
                      <div className="md:col-span-7 flex flex-col h-full min-h-0 bg-slate-900/40 overflow-hidden">
                        {selectedConversationId ? (
                          (() => {
                            const activeConv = conversations.find(c => c.conversationId === selectedConversationId);
                            if (!activeConv) return null;
                            return (
                              <div className="flex flex-col h-full min-h-0 w-full overflow-hidden">
                                {/* Thread header */}
                                <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
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

                                {/* Thread messages: Scrollable independent list */}
                                <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
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
                                              ? 'bg-emerald-600 text-white rounded-br-sm shadow-md'
                                              : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-sm shadow-md'
                                          }`}>
                                            {m.text}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div ref={adminChatEndRef} />
                                </div>

                                {/* Thread reply input: Strictly pinned at bottom */}
                                <form onSubmit={handleSendAdminReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
                                  <input
                                    type="text"
                                    value={adminReplyText}
                                    onChange={(e) => setAdminReplyText(e.target.value)}
                                    placeholder={`Trả lời riêng ${activeConv.visitorName} với tư cách Admin...`}
                                    className="flex-1 py-2 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!adminReplyText.trim() || adminSending}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Gửi</span>
                                  </button>
                                </form>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
                            Chọn một cuộc hội thoại từ danh sách bên trái để xem và trả lời.
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* MODE 2: PUBLIC COMMUNITY CHAT CHANNEL */}
              {chatChannelMode === 'community' && (
                <div className="flex flex-col h-[520px] min-h-0 bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Community Header */}
                  <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Kênh Trò Chuyện Cộng Đồng (Public Community)</span>
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-normal">
                            Thời gian thực
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Nơi các thành viên và khách ghé thăm website trò chuyện công khai cùng nhau và với Admin
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-900/60">
                      {communityMessages.length} tin nhắn
                    </span>
                  </div>

                  {/* Community Messages List */}
                  <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5">
                    {communityMessages.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 text-slate-400 text-xs space-y-2">
                        <Users className="w-8 h-8 text-slate-600 mx-auto" />
                        <p>Kênh trò chuyện cộng đồng chưa có tin nhắn nào.</p>
                        <p className="text-[11px] text-slate-500">Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện cộng đồng!</p>
                      </div>
                    ) : (
                      communityMessages.map((msg) => {
                        const isAdminMsg = msg.senderRole === 'admin';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 group ${isAdminMsg ? 'flex-row-reverse' : 'flex-row'} items-start`}
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 shadow-md">
                              {isAdminMsg ? '👨‍💻' : (msg.senderAvatar || '🚀')}
                            </div>

                            <div className={`max-w-[75%] space-y-1 ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                              <div className={`flex items-center gap-2 px-1 text-[11px] ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                                <span className="font-semibold text-white">{msg.senderName}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-medium ${
                                  isAdminMsg 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                }`}>
                                  {isAdminMsg ? 'Admin' : 'Thành viên'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {/* Delete message button for Admin */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCommunityMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                                  title="Xóa tin nhắn này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap shadow-md ${
                                isAdminMsg
                                  ? 'bg-emerald-600 text-white rounded-tr-sm'
                                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-sm'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={adminCommunityEndRef} />
                  </div>

                  {/* Community Reply Form: Strictly pinned at bottom */}
                  <form onSubmit={handleSendAdminCommunityMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-xs shrink-0">
                      👨‍💻
                    </div>
                    <input
                      type="text"
                      value={adminCommunityReplyText}
                      onChange={(e) => setAdminCommunityReplyText(e.target.value)}
                      placeholder="Gửi tin nhắn vào kênh cộng đồng với tư cách Shinikenvin (Admin)..."
                      className="flex-1 py-2 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!adminCommunityReplyText.trim() || adminCommunitySending}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Cộng Đồng</span>
                    </button>
                  </form>
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

      {/* Non-blocking in-app confirmation modal (eliminates iframe SecurityError from window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmDialog.action;
                  setConfirmDialog(null);
                  await fn();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
