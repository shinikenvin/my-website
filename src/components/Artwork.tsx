import React, { useState } from 'react';
import { Camera, Film, Volume2, VolumeX } from 'lucide-react';
import { parseVideoUrl } from './MediaDisplay';

export function DeveloperPortrait({ 
  className = "w-full h-full",
  avatarUrl = null,
  avatarType = 'image',
  avatarVideoUrl = null,
  onEdit
}: { 
  className?: string;
  avatarUrl?: string | null;
  avatarType?: 'image' | 'video';
  avatarVideoUrl?: string | null;
  onEdit?: () => void;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const isVideo = avatarType === 'video' && Boolean(avatarVideoUrl);
  const parsedVideo = isVideo ? parseVideoUrl(avatarVideoUrl || undefined) : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center p-6 group ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Edit Avatar Trigger Button */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md active:scale-95"
          title="Cập nhật ảnh hoặc video đại diện"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-[11px]">Đổi đại diện</span>
        </button>
      )}

      {/* Video Avatar Mode */}
      {isVideo && parsedVideo ? (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-3xl p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-sky-300 shadow-2xl shadow-cyan-950/60 overflow-hidden group/vid">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 relative">
              {parsedVideo.type === 'direct' ? (
                <video
                  src={parsedVideo.embedUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={`${parsedVideo.embedUrl}&autoplay=1&mute=1&loop=1`}
                  title="Developer Video Avatar"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full border-0 scale-125 pointer-events-none"
                />
              )}

              {parsedVideo.type === 'direct' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-cyan-300 backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity z-20 cursor-pointer"
                  title={isMuted ? 'Bật âm thanh video' : 'Tắt tiếng video'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-800 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Live Video Avatar</span>
            </div>
          </div>
        </div>
      ) : avatarUrl ? (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-sky-300 shadow-2xl shadow-cyan-950/60">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
              <img
                src={avatarUrl}
                alt="Developer Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-800 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md">
              Full-Stack Eng
            </div>
          </div>
        </div>
      ) : (
        /* SVG Stylized Developer Avatar */
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full max-w-[280px] max-h-[280px] drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="avatarGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="avatarFace" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba67d" />
            </linearGradient>
            <linearGradient id="avatarShirt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Subtle decorative tech rings */}
          <circle cx="160" cy="160" r="140" stroke="url(#avatarGlow)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
          <circle cx="160" cy="160" r="152" stroke="#334155" strokeWidth="1" opacity="0.5" />

          {/* Shoulders & Hoodie */}
          <path
            d="M60 300 C60 230 110 200 160 200 C210 200 260 230 260 300 Z"
            fill="url(#avatarShirt)"
            stroke="#334155"
            strokeWidth="2"
          />
          {/* Collar line */}
          <path d="M130 205 L160 235 L190 205" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Neck */}
          <rect x="142" y="165" width="36" height="42" rx="6" fill="#fba67d" />

          {/* Head */}
          <ellipse cx="160" cy="130" rx="46" ry="52" fill="url(#avatarFace)" />

          {/* Stylish Modern Haircut */}
          <path
            d="M110 120 C108 90 125 65 160 65 C195 65 212 90 210 120 C204 100 190 92 160 92 C130 92 116 100 110 120 Z"
            fill="#1e1e24"
          />
          <path
            d="M120 72 C145 55 185 60 200 78 C185 70 145 68 120 72 Z"
            fill="#334155"
          />

          {/* Modern Glasses Frame */}
          <rect x="122" y="118" width="32" height="22" rx="6" stroke="#0ea5e9" strokeWidth="2.5" fill="#0f172a" fillOpacity="0.3" />
          <rect x="166" y="118" width="32" height="22" rx="6" stroke="#0ea5e9" strokeWidth="2.5" fill="#0f172a" fillOpacity="0.3" />
          <line x1="154" y1="128" x2="166" y2="128" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="112" y1="126" x2="122" y2="126" stroke="#0ea5e9" strokeWidth="2.5" />
          <line x1="198" y1="126" x2="208" y2="126" stroke="#0ea5e9" strokeWidth="2.5" />

          {/* Friendly smile */}
          <path d="M148 156 Q160 166 172 156" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Headphones band */}
          <path d="M106 130 C104 90 120 75 160 75 C200 75 216 90 214 130" stroke="#64748b" strokeWidth="3" fill="none" />
          <rect x="102" y="120" width="10" height="28" rx="4" fill="#0284c7" />
          <rect x="208" y="120" width="10" height="28" rx="4" fill="#0284c7" />

          {/* Floating Code symbols */}
          <text x="36" y="90" fill="#38bdf8" fontSize="16" fontFamily="monospace" opacity="0.8">&lt;dev&gt;</text>
          <text x="240" y="100" fill="#818cf8" fontSize="16" fontFamily="monospace" opacity="0.8">&lt;/&gt;</text>
          <text x="45" y="240" fill="#34d399" fontSize="14" fontFamily="monospace" opacity="0.7">git:main</text>
          <text x="235" y="235" fill="#f43f5e" fontSize="13" fontFamily="monospace" opacity="0.7">CI/CD ✓</text>
        </svg>
      )}
    </div>
  );
}

export function ProjectArtwork({ category, title }: { category: string; title: string }) {
  if (category === 'devtools') {
    return (
      <div className="w-full h-full min-h-[190px] relative overflow-hidden bg-slate-900 flex flex-col justify-between p-5 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-indigo-950/20" />
        {/* Terminal Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-cyan-400/90 tracking-wide">workflow.yml · pipeline</span>
        </div>

        {/* Visual Pipeline nodes */}
        <div className="relative z-10 py-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="px-2.5 py-1.5 rounded bg-slate-800/90 border border-slate-700/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Checkout</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <div className="px-2.5 py-1.5 rounded bg-slate-800/90 border border-slate-700/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Build & Lint</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gradient-to-r from-indigo-500 to-emerald-500" />
            <div className="px-2.5 py-1.5 rounded bg-slate-800/90 border border-slate-700/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Deploy</span>
            </div>
          </div>
        </div>

        {/* Terminal output line */}
        <div className="relative z-10 font-mono text-[12px] text-slate-400 bg-slate-950/70 p-2.5 rounded border border-slate-800/80 truncate">
          <span className="text-emerald-400 font-semibold">$ gh-pages:</span> Artifact uploaded successfully to Pages URL (100%)
        </div>
      </div>
    );
  }

  if (category === 'ai-cloud') {
    return (
      <div className="w-full h-full min-h-[190px] relative overflow-hidden bg-slate-900 flex flex-col justify-between p-5 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-950/50 via-transparent to-cyan-950/30" />
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            TELEMETRY LIVE
          </span>
          <span className="tabular-nums">LATENCY: 42ms</span>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="relative z-10 py-2">
          <svg viewBox="0 0 280 60" className="w-full h-14 overflow-visible">
            <defs>
              <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0 45 Q 35 15, 70 30 T 140 18 T 210 25 T 280 12 L 280 60 L 0 60 Z"
              fill="url(#cloudGrad)"
            />
            <path
              d="M0 45 Q 35 15, 70 30 T 140 18 T 210 25 T 280 12"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
            />
            <circle cx="280" cy="12" r="3.5" fill="#38bdf8" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-300">
          <span className="text-slate-400">Throughput:</span>
          <span className="text-cyan-400 font-semibold tabular-nums">14.5M req/day · 99.98%</span>
        </div>
      </div>
    );
  }

  // Default web / mobile / creative
  return (
    <div className="w-full h-full min-h-[190px] relative overflow-hidden bg-slate-900 flex flex-col justify-between p-5 border-b border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 via-slate-900 to-indigo-950/40" />
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="text-cyan-400 font-medium">MODERN WEB UI</span>
        <span className="text-slate-500">60 FPS · GPU</span>
      </div>

      {/* Modern Wireframe Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 my-2">
        <div className="h-16 rounded bg-slate-800/80 border border-slate-700/60 p-2 flex flex-col justify-between">
          <div className="w-6 h-1.5 rounded bg-cyan-400/80" />
          <div className="w-full h-1 rounded bg-slate-600/60" />
          <div className="w-4/5 h-1 rounded bg-slate-600/40" />
        </div>
        <div className="col-span-2 h-16 rounded bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/60 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-2 rounded bg-indigo-400/90" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded bg-slate-600/60" />
            <div className="w-2/3 h-1.5 rounded bg-slate-600/40" />
          </div>
        </div>
      </div>

      <div className="relative z-10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>Stack: React + Tailwind + Motion</span>
        <span className="text-emerald-400">Lighthouse 100/100</span>
      </div>
    </div>
  );
}

export function BlogArtwork({ category }: { category: string }) {
  return (
    <div className="w-full h-36 sm:h-40 relative overflow-hidden bg-slate-900/90 rounded-t-2xl flex flex-col items-center justify-center p-6 border-b border-slate-800/90">
      {/* Matrix dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
        <div className="w-11 h-11 rounded-xl bg-slate-950/90 border border-slate-700/80 flex items-center justify-center text-cyan-400 font-mono font-bold text-base shadow-md">
          <span>&lt;/&gt;</span>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-semibold">
          {category.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
