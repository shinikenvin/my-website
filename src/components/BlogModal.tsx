import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { X, Heart, Share2, Copy, Check, BookOpen, Clock, Calendar } from 'lucide-react';

interface BlogModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export function BlogModal({ post, onClose }: BlogModalProps) {
  const [likes, setLikes] = useState(post?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (post) {
      setLikes(post.likes);
      setHasLiked(false);
    }
  }, [post]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (post) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCopyCode = async (code: string, id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
    } catch (err) {
      console.warn('Clipboard writeText failed:', err);
    }
    setCopiedCodeKey(id);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.warn('Clipboard share failed:', err);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Blog Kỹ Thuật</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{post.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Sao chép liên kết chia sẻ"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Content Container */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Metadata bar - Zero-Pill discipline */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{post.date}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{post.readTime}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Tác giả: Shinikenvin</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight text-balance">
            {post.title}
          </h1>

          {/* Summary Lead */}
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed p-4 rounded-xl bg-slate-950/60 border border-slate-800 border-l-4 border-l-cyan-400">
            {post.summary}
          </p>

          {/* Introduction */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {post.content.introduction}
          </p>

          {/* Article Sections */}
          <div className="space-y-8 pt-4">
            {post.content.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {section.heading}
                </h2>
                
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {section.body}
                </p>

                {/* Bullet Points if any */}
                {section.bulletPoints && (
                  <ul className="space-y-2 pl-2">
                    {section.bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Code Snippet Block */}
                {section.codeSnippet && (
                  <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
                      <span>{section.codeSnippet.filename || `${section.codeSnippet.language}`}</span>
                      <button
                        onClick={() => handleCopyCode(section.codeSnippet!.code, `code-${idx}`)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        {copiedCodeKey === `code-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono">
              Tổng kết &amp; Lời khuyên
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>

          {/* Tags - Zero-Pill text discipline */}
          <div className="pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 mr-2">Chủ đề liên quan:</span>
            <span>{post.tags.join(' · ')}</span>
          </div>

          {/* Article Footer with Like & Share */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                hasLiked
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="tabular-nums font-mono">{likes}</span>
              <span>Hữu ích</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Đóng bài viết
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
