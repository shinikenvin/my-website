import React, { useState, useRef } from 'react';
import { X, Upload, Image, Link, RotateCcw, Check, Camera, Sparkles } from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onSaveAvatar: (avatarUrl: string | null) => void;
}

export function AvatarModal({ isOpen, onClose, currentAvatar, onSaveAvatar }: AvatarModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'github'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileError('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, GIF,...)');
      setTimeout(() => setFileError(null), 4000);
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setSelectedAvatar(customUrl.trim());
    }
  };

  const handleSelectGithub = () => {
    const ghUrl = 'https://github.com/shinikenvin.png';
    setSelectedAvatar(ghUrl);
  };

  const handleResetDefault = () => {
    setSelectedAvatar(null);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cập Nhật Ảnh Đại Diện</h3>
              <p className="text-xs text-slate-400">Thay đổi ảnh chân dung hiển thị trên trang chủ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/80 bg-slate-950 shadow-xl shadow-cyan-950/50 flex items-center justify-center">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/60 p-2 text-center">
                  <Sparkles className="w-8 h-8 text-cyan-400 mb-1" />
                  <span className="text-[11px] font-mono text-slate-400">Ảnh minh họa mặc định</span>
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-slate-400">Xem trước hiển thị</span>
          </div>

          {fileError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 text-center animate-in fade-in">
              {fileError}
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải từ máy</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'github'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Ảnh GitHub</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Nhập URL</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-slate-700/80 hover:border-cyan-500/80 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-xs font-semibold text-white">
                Bấm để chọn ảnh từ máy tính hoặc kéo thả ảnh vào đây
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ PNG, JPG, JPEG, WEBP (Tự động lưu và hiển thị tức thì)
              </p>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300">
                Lấy ảnh đại diện tự động từ tài khoản GitHub của bạn (<code className="text-cyan-300 font-mono">shinikenvin</code>):
              </p>
              <button
                onClick={handleSelectGithub}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-cyan-950/40"
              >
                <Image className="w-4 h-4" />
                <span>Sử dụng ảnh đại diện GitHub (shinikenvin.png)</span>
              </button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-medium">
                Dán đường link ảnh trực tuyến:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}

          {/* Reset button if custom avatar is set */}
          {selectedAvatar && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleResetDefault}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ảnh minh họa mặc định</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
          >
            <Check className="w-4 h-4" />
            <span>Lưu ảnh đại diện</span>
          </button>
        </div>
      </div>
    </div>
  );
}
