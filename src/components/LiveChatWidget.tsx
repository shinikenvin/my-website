import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, User, Mail, Sparkles, Volume2, VolumeX, 
  Minus, Check, CheckCheck, Smile, ShieldCheck, Edit3, ChevronDown
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ChatMessage, ChatUserProfile } from '../types/chat';
import { playChatChime } from '../utils/audioChime';
import { usePortfolioData } from '../context/PortfolioDataContext';

const AVATAR_OPTIONS = ['🚀', '💻', '🦊', '⚡', '🤖', '🎨', '🐱', '☕', '🎮', '💡'];
const COLOR_OPTIONS = [
  { name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400' },
  { name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400' },
  { name: 'Violet', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-400' },
  { name: 'Rose', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-400' },
  { name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400' },
];

const SUGGESTIONS = [
  '💼 Báo giá & Hợp tác dự án Web',
  '🚀 Tư vấn giải pháp kiến trúc Full-Stack',
  '☕ Kết nối & Giao lưu kỹ thuật',
];

export function LiveChatWidget() {
  const { personalInfo } = usePortfolioData();

  // Widget visibility state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // User Profile state
  const [userProfile, setUserProfile] = useState<ChatUserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: '🚀',
    color: 'Cyan',
    remember: true,
  });

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Load saved user profile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shinikenvin_chat_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && parsed.email) {
            setUserProfile(parsed);
            setProfileForm({
              name: parsed.name,
              email: parsed.email,
              avatar: parsed.avatar || '🚀',
              color: parsed.color || 'Cyan',
              remember: true,
            });
          }
        } catch (e) {
          console.warn('Failed to parse saved chat profile', e);
        }
      }
    }
  }, []);

  // 2. Real-time Firestore sync for this visitor's conversation
  useEffect(() => {
    if (!userProfile?.userId) return;

    try {
      const q = query(
        collection(db, 'live_chat'),
        where('conversationId', '==', userProfile.userId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });

        // Detect new incoming admin message for chime & unread count
        if (msgs.length > messages.length && messages.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderRole === 'admin') {
            if (soundEnabled) playChatChime('receive');
            if (!isOpen) setUnreadCount((prev) => prev + 1);
          }
        }

        setMessages(msgs);
      }, (err) => {
        console.warn('Firestore live chat listener error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Live chat query setup error:', err);
    }
  }, [userProfile?.userId, messages.length, soundEnabled, isOpen]);

  // Scroll to bottom whenever messages update or chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) return;

    const newProfile: ChatUserProfile = {
      userId: userProfile?.userId || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      avatar: profileForm.avatar,
      color: profileForm.color,
      createdAt: userProfile?.createdAt || new Date().toISOString(),
    };

    setUserProfile(newProfile);
    setShowProfileSetup(false);

    if (profileForm.remember) {
      localStorage.setItem('shinikenvin_chat_profile', JSON.stringify(newProfile));
    } else {
      localStorage.removeItem('shinikenvin_chat_profile');
    }
  };

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !userProfile || sending) return;

    setSending(true);
    setInputText('');

    try {
      const newMsgData = {
        conversationId: userProfile.userId,
        senderId: userProfile.userId,
        senderName: userProfile.name,
        senderEmail: userProfile.email,
        senderAvatar: userProfile.avatar,
        senderRole: 'visitor' as const,
        text: textToSend,
        createdAt: new Date().toISOString(),
        readByAdmin: false,
        readByVisitor: true,
      };

      await addDoc(collection(db, 'live_chat'), newMsgData);
      if (soundEnabled) playChatChime('send');

      // If this is the visitor's first message, also trigger automatic welcome message after a brief pause
      if (messages.length === 0) {
        setTimeout(async () => {
          try {
            await addDoc(collection(db, 'live_chat'), {
              conversationId: userProfile.userId,
              senderId: 'admin_bot',
              senderName: 'Shinikenvin (Admin)',
              senderEmail: personalInfo.email,
              senderAvatar: personalInfo.avatarUrl || '👨‍💻',
              senderRole: 'admin',
              text: `Chào ${userProfile.name}! 👋 Cảm ơn bạn đã nhắn tin. Shinikenvin đã nhận được thông tin và sẽ phản hồi lại bạn qua khung chat này hoặc email ${userProfile.email} nhé! 🚀`,
              createdAt: new Date().toISOString(),
              readByAdmin: true,
              readByVisitor: false,
            });
          } catch (e) {
            console.warn('Welcome msg error', e);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Floating Chat Launcher Button (PC & Mobile) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
          {/* Unread badge & greeting pill (Visible on desktop) */}
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-cyan-800/60 shadow-xl shadow-slate-950/60 text-xs font-medium text-slate-200 cursor-pointer backdrop-blur-md hover:border-cyan-500 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Trực tuyến · Chat với Shinikenvin</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setUnreadCount(0);
            }}
            className="relative p-3.5 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 shadow-xl shadow-cyan-950/80 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
            aria-label="Mở khung chat trực tuyến"
          >
            <MessageSquare className="w-6 h-6 text-slate-950 group-hover:rotate-6 transition-transform" />
            
            {/* Pulsing online indicator */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />

            {/* Unread Message Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 px-1.5 py-0.5 text-[10px] font-bold font-mono text-white bg-rose-500 rounded-full border-2 border-slate-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Live Chat Window (Responsive: Mobile Full-width Drawer / Desktop Floating Card) */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-5 right-5 w-72 h-14' 
            : 'inset-x-0 bottom-0 sm:inset-auto sm:bottom-5 sm:right-5 w-full sm:w-[390px] h-[85vh] sm:h-[550px]'
        }`}>
          <div className="w-full h-full flex flex-col bg-slate-900/95 sm:rounded-2xl rounded-t-2xl border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Shinikenvin Avatar with online dot */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-900 shrink-0">
                  {personalInfo.avatarUrl ? (
                    <img src={personalInfo.avatarUrl} alt="Shinikenvin" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-sm font-bold text-cyan-400">
                      SK
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>

                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">Shinikenvin</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Đang trực tuyến · Phản hồi nhanh</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 text-slate-400">
                {userProfile && !isMinimized && (
                  <button
                    onClick={() => setShowProfileSetup(true)}
                    className="p-1.5 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors text-xs flex items-center gap-1 font-mono"
                    title="Chỉnh sửa thông tin của bạn"
                  >
                    <span className="text-sm">{userProfile.avatar}</span>
                    <span className="hidden sm:inline text-[11px] text-slate-300 max-w-[70px] truncate">{userProfile.name}</span>
                    <Edit3 className="w-3 h-3 text-slate-500" />
                  </button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                  title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hidden sm:block p-1.5 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                  title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                  title="Đóng chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* When minimized: click to expand */}
            {isMinimized ? (
              <div 
                onClick={() => setIsMinimized(false)}
                className="w-full h-full flex items-center justify-between px-4 cursor-pointer hover:bg-slate-800/40 text-xs text-slate-300 font-medium"
              >
                <span>Nhấn để mở khung chat</span>
                <span className="text-cyan-400 text-xs">Mở rộng ↑</span>
              </div>
            ) : (
              <>
                {/* VIEW 1: User Profile Setup Form ("yêu cầu thiết lập thông tin người dùng") */}
                {(!userProfile || showProfileSetup) ? (
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-center">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 text-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/50">
                        {profileForm.avatar}
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {userProfile ? 'Cập Nhật Thông Tin Của Bạn' : 'Thiết Lập Thông Tin Để Trò Chuyện'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Vui lòng để lại tên và email để Shinikenvin có thể nhận diện và hỗ trợ bạn chu đáo nhất.
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Họ và tên của bạn <strong className="text-rose-400">*</strong></span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Ví dụ: Hoàng Long, Alex..."
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Địa chỉ email nhận phản hồi <strong className="text-rose-400">*</strong></span>
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                          required
                        />
                      </div>

                      {/* Select Avatar Emoji */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Chọn biểu tượng đại diện của bạn:</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {AVATAR_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, avatar: emoji })}
                              className={`p-2 rounded-xl text-lg flex items-center justify-center transition-all ${
                                profileForm.avatar === emoji
                                  ? 'bg-cyan-950 border-2 border-cyan-400 scale-105'
                                  : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Remember checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 pt-1">
                        <input
                          type="checkbox"
                          checked={profileForm.remember}
                          onChange={(e) => setProfileForm({ ...profileForm, remember: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 accent-cyan-400 cursor-pointer"
                        />
                        <span>Ghi nhớ thông tin trên thiết bị này</span>
                      </label>

                      <div className="pt-2 flex items-center gap-2">
                        {userProfile && (
                          <button
                            type="button"
                            onClick={() => setShowProfileSetup(false)}
                            className="flex-1 py-2 px-3 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
                          >
                            Hủy bỏ
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>{userProfile ? 'Lưu Thông Tin' : 'Bắt Đầu Trò Chuyện'}</span>
                          <span>💬</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* VIEW 2: Chat Messages & Input Bar */
                  <>
                    {/* Message list area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                      
                      {/* Welcome card if empty */}
                      {messages.length === 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 space-y-2 text-xs leading-relaxed text-slate-300">
                            <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                              <span>👋 Xin chào {userProfile.name}!</span>
                            </p>
                            <p>
                              Cảm ơn bạn đã ghé thăm Portfolio của Shinikenvin. Hãy gửi tin nhắn hoặc chọn gợi ý nhanh bên dưới để bắt đầu trao đổi nhé!
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                              Gợi ý câu hỏi nhanh:
                            </span>
                            <div className="space-y-1.5">
                              {SUGGESTIONS.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendMessage(suggestion)}
                                  className="w-full text-left p-2.5 text-xs text-slate-300 hover:text-white bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-700/80 rounded-xl transition-all flex items-center justify-between group active:scale-[0.99]"
                                >
                                  <span>{suggestion}</span>
                                  <Send className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Messages Stream */}
                      {messages.map((msg) => {
                        const isVisitor = msg.senderRole === 'visitor';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 ${isVisitor ? 'flex-row-reverse' : 'flex-row'} items-end`}
                          >
                            {/* Avatar Bubble */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                              isVisitor 
                                ? 'bg-cyan-950 border border-cyan-700 text-cyan-300' 
                                : 'bg-slate-950 border border-emerald-500 overflow-hidden'
                            }`}>
                              {isVisitor ? (
                                <span>{msg.senderAvatar || '🚀'}</span>
                              ) : (
                                personalInfo.avatarUrl ? (
                                  <img src={personalInfo.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                  <span>👨‍💻</span>
                                )
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[78%] space-y-1 ${isVisitor ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                                <span className="font-medium text-slate-300">{msg.senderName}</span>
                                {!isVisitor && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono">
                                    Admin
                                  </span>
                                )}
                              </div>

                              <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap ${
                                isVisitor
                                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-medium rounded-br-sm shadow-md shadow-cyan-950/50'
                                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-sm shadow-md'
                              }`}>
                                {msg.text}
                              </div>

                              <div className={`text-[9px] font-mono text-slate-400 px-1 flex items-center gap-1 ${
                                isVisitor ? 'justify-end' : 'justify-start'
                              }`}>
                                <span>{formatMessageTime(msg.createdAt)}</span>
                                {isVisitor && (
                                  <CheckCheck className="w-3 h-3 text-cyan-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom input area */}
                    <div className="p-3 bg-slate-950/90 border-t border-slate-800 shrink-0">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Nhập tin nhắn với Shinikenvin..."
                          className="flex-1 py-2.5 px-3.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!inputText.trim() || sending}
                          className="p-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-950/50 active:scale-95 shrink-0"
                          aria-label="Gửi tin nhắn"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                      <div className="flex items-center justify-between pt-1.5 px-1 text-[10px] text-slate-400">
                        <span>Nhấn Enter để gửi</span>
                        <span>Mã hóa & lưu trữ Firebase</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
