import React, { useState } from 'react';
import { Play, Image as ImageIcon, Film, X, ExternalLink, ZoomIn } from 'lucide-react';

interface MediaDisplayProps {
  videoUrl?: string;
  videoTitle?: string;
  coverImage?: string;
  galleryImages?: string[];
  title?: string;
}

export function parseVideoUrl(url?: string): { type: 'youtube' | 'vimeo' | 'loom' | 'direct' | 'unknown'; embedUrl: string } | null {
  if (!url || !url.trim()) return null;
  const clean = url.trim();

  // YouTube
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Loom
  const loomMatch = clean.match(/(?:loom\.com\/(?:share|embed)\/)([\w-]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Direct MP4 / WebM or data URI
  if (clean.match(/\.(mp4|webm|ogg)($|\?)/i) || clean.startsWith('data:video/')) {
    return {
      type: 'direct',
      embedUrl: clean,
    };
  }

  // Fallback as iframe
  return {
    type: 'unknown',
    embedUrl: clean,
  };
}

export function MediaDisplay({ videoUrl, videoTitle, coverImage, galleryImages, title }: MediaDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const parsedVideo = parseVideoUrl(videoUrl);

  const validGallery = (galleryImages || []).filter(img => Boolean(img?.trim()));

  if (!parsedVideo && !coverImage && validGallery.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 my-6">
      {/* Video Introduction Player */}
      {parsedVideo && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>{videoTitle || 'Video Demo & Giới Thiệu'}</span>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
            {parsedVideo.type === 'direct' ? (
              <video 
                controls 
                playsInline 
                preload="metadata"
                className="w-full h-full object-cover"
                src={parsedVideo.embedUrl}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            ) : (
              <iframe
                src={parsedVideo.embedUrl}
                title={videoTitle || title || 'Video presentation'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      )}

      {/* Primary Cover Image (if not already represented) */}
      {coverImage && !parsedVideo && (
        <div className="relative w-full max-h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950 group">
          <img 
            src={coverImage} 
            alt={title || 'Cover image'} 
            className="w-full h-full object-cover max-h-[380px] group-hover:scale-[1.01] transition-transform duration-300"
          />
          <button
            type="button"
            onClick={() => setSelectedImage(coverImage)}
            className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-1.5 opacity-90 hover:opacity-100 backdrop-blur-sm transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Xem cỡ lớn</span>
          </button>
        </div>
      )}

      {/* Gallery Screenshots */}
      {validGallery.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>Bộ sưu tập hình ảnh &amp; Giao diện ({validGallery.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {validGallery.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="group relative aspect-video rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/80 bg-slate-950 cursor-pointer shadow transition-all duration-200"
              >
                <img 
                  src={img} 
                  alt={`Screenshot ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for enlarged viewing */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-h-[85vh] max-w-full rounded-2xl border border-slate-700/80 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
