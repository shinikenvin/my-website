import React, { useState, useRef } from 'react';
import { X, Upload, Image, Link, RotateCcw, Check, Camera, Sparkles, Film, Trash2 } from 'lucide-react';
import { parseVideoUrl } from './MediaDisplay';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  currentType?: 'image' | 'video';
  currentVideo?: string | null;
  onSaveAvatar: (avatarUrl: string | null, avatarType?: 'image' | 'video', avatarVideoUrl?: string | null) => void;
}

export function AvatarModal({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  currentType = 'image',
  currentVideo = null,
  onSaveAvatar 
}: AvatarModalProps) {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(currentType);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(currentVideo);
  const [customUrl, setCustomUrl] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
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
        setMediaType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setFileError('Vui lòng chọn tệp video hợp lệ (MP4, WebM, MOV,...)');
      setTimeout(() => setFileError(null), 4000);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFileError('Video nên có dung lượng dưới 8MB để tối ưu hóa thời gian tải');
      setTimeout(() => setFileError(null), 4000);
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedVideo(event.target.result as string);
        setMediaType('video');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar, mediaType, selectedVideo);
    onClose();
  };

  const parsedVideo = selectedVideo ? parseVideoUrl(selectedVideo) : null;

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
              <h3 className="text-base font-bold text-white">Cập Nhật Ảnh &amp; Video Đại Diện</h3>
              <p className="text-xs text-slate-400">Tùy biến hình chân dung hoặc video live avatar trang chủ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {fileError && (
            <div className="p-3 text-xs rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
              {fileError}
            </div>
          )}

          {/* Mode Switcher Tabs: Photo vs Video */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mediaType === 'image'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Ảnh Đại Diện (Photo)</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mediaType === 'video'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video Đại Diện (Live Video)</span>
            </button>
          </div>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
            accept="video/*"
            className="hidden"
          />

          {/* Preview Area */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="relative w-36 h-36 rounded-3xl p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-sky-300 shadow-2xl shadow-cyan-950/60 overflow-hidden">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center relative">
                {mediaType === 'video' && selectedVideo && parsedVideo ? (
                  parsedVideo.type === 'direct' ? (
                    <video
                      src={parsedVideo.embedUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={`${parsedVideo.embedUrl}&autoplay=1&mute=1&loop=1`}
                      title="Video avatar"
                      className="w-full h-full border-0 scale-125 pointer-events-none"
                    />
                  )
                ) : selectedAvatar ? (
                  <img src={selectedAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-10 h-10 text-cyan-400" />
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold text-white">
                {mediaType === 'video' ? 'Xem trước Live Video Avatar' : 'Xem trước Ảnh đại diện'}
              </p>
              <p className="text-[11px] text-slate-400">
                {mediaType === 'video' ? 'Video sẽ tự động lặp lại (Loop) trên trang chủ' : 'Ảnh chân dung chất lượng cao'}
              </p>
            </div>
          </div>

          {/* Media Specific Controls */}
          {mediaType === 'video' ? (
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải video từ máy tính (.mp4, .webm)</span>
                </button>

                {selectedVideo && (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(null)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa video</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Link className="w-3 h-3 text-slate-500" />
                  <span>Hoặc dán URL Video (YouTube, Vimeo, Loom hoặc file .mp4):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... hoặc .mp4"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customVideoUrl.trim()) setSelectedVideo(customVideoUrl.trim());
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy tính / điện thoại</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAvatar('https://github.com/shinikenvin.png')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-750 text-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>GitHub (shinikenvin.png)</span>
                </button>

                {selectedAvatar && (
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(null)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại mặc định</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Link className="w-3 h-3 text-slate-500" />
                  <span>Hoặc dán URL hình ảnh:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrl.trim()) setSelectedAvatar(customUrl.trim());
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cài Đặt Đại Diện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
