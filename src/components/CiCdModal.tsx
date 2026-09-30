import React, { useState, useEffect } from 'react';
import { X, Terminal, Copy, Check, ExternalLink, Download, CheckCircle2, ArrowRight, FolderDown, Archive } from 'lucide-react';
import { WORKFLOW_SNIPPET, PERSONAL_INFO } from '../data/portfolioData';
import { downloadProjectZip } from '../utils/exportZip';

interface CiCdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CiCdModal({ isOpen, onClose }: CiCdModalProps) {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'yaml' | 'manual'>('guide');

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const gitCommands = `# 1. Khởi tạo Git và thêm tất cả tệp nguồn
git init
git add .
git commit -m "feat: setup portfolio website with GitHub Actions CI/CD"

# 2. Đổi nhánh mặc định thành main
git branch -M main

# 3. Kết nối với repository của bạn trên GitHub
git remote add origin https://github.com/shinikenvin/my-website.git

# 4. Đẩy mã nguồn lên để kích hoạt pipeline tự động
git push -u origin main`;

  const manualCommands = `# 1. Biên dịch dự án React thành gói tĩnh tĩnh (Static HTML & Assets)
npm run build

# Thư mục dist/ đã được tạo thành công gồm:
# - dist/index.html (Trang chủ tĩnh)
# - dist/assets/ (Toàn bộ CSS, JS, Fonts tương đối ./)

# 2. Bạn có thể copy toàn bộ nội dung trong dist/ sang thư mục repo
# Hoặc triển khai nhanh nhánh gh-pages bằng công cụ:
npx gh-pages -d dist`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(WORKFLOW_SNIPPET);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2200);
  };

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2200);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([WORKFLOW_SNIPPET], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Triển Khai CI/CD Với GitHub Actions</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Mục tiêu: {PERSONAL_INFO.website}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Triển khai tự động CI/CD (Khuyên dùng)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'manual'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Tự đẩy trực tiếp file index.html (Thủ công)
          </button>
          <button
            onClick={() => setActiveTab('yaml')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'yaml'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Tệp cấu hình deploy.yml
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {activeTab === 'guide' && (
            <div className="space-y-6">
              
              {/* Target Banner */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-1.5">
                <div className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                  Trang web của bạn sẽ tự động chạy tại:
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <a
                    href={PERSONAL_INFO.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm sm:text-base font-mono font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{PERSONAL_INFO.website}</span>
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </a>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Auto-Deploy khi Push
                  </span>
                </div>
              </div>

              {/* Step 1 */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">1</span>
                  <span>Cấu hình đường dẫn Base trong `vite.config.ts` (Đã hoàn tất)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  Dự án đã được cấu hình <code className="text-cyan-300 font-mono">base: './'</code> trong <code className="text-slate-200 font-mono">vite.config.ts</code> để tự động nhận diện đúng thư mục con <code className="text-cyan-300 font-mono">/my-website/</code> mà không bao giờ bị lỗi đường dẫn file CSS/JS.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">2</span>
                  <span>Tải toàn bộ mã nguồn (.zip) của website về máy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  Bấm nút bên dưới để tải tệp zip chứa toàn bộ code (đã gồm thư mục <code className="text-cyan-300 font-mono">.github/workflows/deploy.yml</code>, <code className="text-slate-200 font-mono">src</code>, <code className="text-slate-200 font-mono">package.json</code>,...).
                </p>
                <div className="pl-7 pt-1">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-cyan-950/50 disabled:opacity-50"
                  >
                    {isDownloadingZip ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Đang nén file zip...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Tải tệp my-website-source.zip về máy</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    💡 Sau khi tải xong, bạn chỉ cần mở file zip và giải nén (hoặc copy tất cả file bên trong) thả vào thư mục <code className="text-cyan-300 font-mono">Desktop\my-website</code>!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">3</span>
                    <span>Lệnh đẩy mã nguồn lên GitHub (Chạy tại Terminal của bạn)</span>
                  </div>
                  <button
                    onClick={handleCopyCommands}
                    className="px-2.5 py-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    {copiedCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCommands ? 'Đã chép lệnh' : 'Sao chép lệnh'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{gitCommands}</code>
                </pre>
              </div>

              {/* Step 4 */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">4</span>
                  <span>Bật chế độ GitHub Actions trong Repository Settings</span>
                </div>
                <div className="pl-7 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <p>Truy cập vào repository của bạn trên GitHub:</p>
                  <p className="font-mono text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800/80">
                    GitHub Repo → Settings → Pages → Build and deployment → Source: chọn "GitHub Actions"
                  </p>
                  <p className="text-slate-400">
                    Sau khi chọn "GitHub Actions", chuyển sang tab <strong>Actions</strong> để thấy workflow chạy tự động. Chỉ sau khoảng 40 giây, website của bạn sẽ online!
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-5">
              {/* Question response banner */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                  Đẩy dạng index.html trực tiếp có hợp lý không?
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white font-semibold">Rất hợp lý!</strong> Vì GitHub Pages về bản chất luôn tìm kiếm tệp <code className="text-cyan-300 font-mono">index.html</code> tại thư mục gốc (root) để hiển thị website.
                </p>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-emerald-400 block mb-1">✓ Lợi ích cách thủ công:</span>
                    <span className="text-slate-400">Đơn giản, trực quan, không phụ thuộc vào GitHub Actions nếu bạn chỉ muốn đưa trang lên một lần.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-amber-400 block mb-1">⚠ Nhược điểm:</span>
                    <span className="text-slate-400">Mỗi lần sửa bài viết hay dự án mới, bạn phải tự gõ <code className="text-slate-300 font-mono">npm run build</code> rồi copy file thủ công.</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">1</span>
                    <span>Lệnh build mã nguồn ra thư mục dist/</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('npm run build');
                      setCopiedCommands(true);
                      setTimeout(() => setCopiedCommands(false), 2000);
                    }}
                    className="text-xs text-cyan-400 font-mono flex items-center gap-1"
                  >
                    {copiedCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCommands ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                  <code>npm run build</code>
                </pre>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Lệnh trên chỉ mất <strong>~700ms</strong> để tạo ra thư mục <code className="text-cyan-300 font-mono">dist/</code> chứa:
                </p>
                <div className="space-y-1 text-xs font-mono text-slate-400 pl-4 border-l-2 border-slate-800">
                  <div>├── dist/index.html <span className="text-slate-500">(File HTML tĩnh hoàn chỉnh)</span></div>
                  <div>└── dist/assets/ <span className="text-slate-500">(Toàn bộ file CSS, JS tối ưu hóa)</span></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">2</span>
                  <span>Cách đưa thư mục dist/ lên GitHub Pages</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p><strong>Cách A (Dễ nhất với tool gh-pages):</strong></p>
                  <pre className="p-2.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs">
                    npx gh-pages -d dist
                  </pre>
                  <p className="text-slate-400">Lệnh này sẽ tự động tạo nhánh <code className="text-slate-200">gh-pages</code> và đẩy thẳng thư mục dist lên GitHub.</p>

                  <p className="pt-2"><strong>Cách B (Copy trực tiếp vào repo):</strong></p>
                  <p className="text-slate-400">Copy toàn bộ file bên trong <code className="text-slate-200 font-mono">dist/</code> (bao gồm <code className="text-slate-200 font-mono">index.html</code> và thư mục <code className="text-slate-200 font-mono">assets/</code>) thả thẳng vào thư mục gốc của repository GitHub <code className="text-slate-200 font-mono">shinikenvin/my-website</code> rồi push lên.</p>
                </div>
              </div>

              {/* Settings check */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-300">Cấu hình GitHub Settings:</span>
                <p>Nếu tự đẩy file thủ công theo Cách A/B: Vào GitHub Repo → <strong>Settings → Pages → Source: "Deploy from a branch"</strong> → Chọn nhánh <code className="text-cyan-300">gh-pages</code> hoặc <code className="text-cyan-300">main</code>.</p>
              </div>

            </div>
          )}

          {activeTab === 'yaml' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400">.github/workflows/deploy.yml</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyWorkflow}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWorkflow ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleDownloadYaml}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[420px]">
                <code>{WORKFLOW_SNIPPET}</code>
              </pre>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              CI/CD Powered by GitHub Actions &amp; Vite
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              Đã hiểu &amp; Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
