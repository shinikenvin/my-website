import { Project, BlogPost, ExperienceItem, SkillGroup } from '../types';

export const PERSONAL_INFO = {
  name: 'Shinikenvin',
  role: 'Full-Stack Software Engineer & Creative Developer',
  email: 'Shinikenvin@gmail.com',
  github: 'https://github.com/shinikenvin',
  website: 'https://shinikenvin.github.io/my-website/',
  repoUrl: 'https://github.com/shinikenvin/my-website',
  location: 'Việt Nam (Làm việc từ xa & Hybrid)',
  status: 'Sẵn sàng nhận dự án mới & Hợp tác',
  bio: 'Kỹ sư phần mềm đam mê xây dựng các giao diện người dùng có tính tương tác cao, kiến trúc hệ thống phân tán chịu tải lớn và quy trình tự động hóa CI/CD hiện đại. Luôn hướng tới sự tinh gọn, hiệu năng vượt trội và chuẩn mực thiết kế bền vững.',
  stats: [
    { label: 'Năm kinh nghiệm thực chiến', value: '4+' },
    { label: 'Dự án đã bàn giao & triển khai', value: '28+' },
    { label: 'Tỉ lệ hài lòng khách hàng', value: '99.4%' },
    { label: 'Commits mã nguồn mở', value: '1.4k+' },
  ],
};

export const PROJECTS_DATA: Project[] = [
  {
    id: 'nexusflow-orchestrator',
    title: 'NexusFlow Automation Pipeline',
    subtitle: 'Nền tảng tự động hóa quy trình CI/CD & điều phối tác vụ phân tán',
    description: 'Hệ thống quản lý và kích hoạt pipeline triển khai mã nguồn tự động, tích hợp webhooks từ GitHub/GitLab, giám sát container và phân phối artifact với độ trễ dưới 120ms.',
    category: 'devtools',
    categoryLabel: 'DevOps & Công cụ',
    tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'Docker', 'GitHub API', 'Node.js'],
    year: '2026',
    featured: true,
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    fullCaseStudy: {
      overview: 'NexusFlow được thiết kế nhằm giải quyết bài toán nút thắt cổ chai khi kiểm thử và triển khai các micro-services trong môi trường đa cụm.',
      challenge: 'Các giải pháp CI/CD truyền thống tiêu tốn nhiều tài nguyên khi xử lý đồng thời hàng chục build queue, gây trễ phản hồi cho kỹ sư khi deploy production.',
      solution: 'Xây dựng engine phân luồng bằng worker pools, tối ưu hóa caching đa tầng trên đĩa NVMe và tích hợp dashboard thời gian thực qua Server-Sent Events.',
      architecture: [
        'Frontend SPA xây dựng trên React 19 kết hợp Framer Motion cho các trạng thái pipeline trực quan',
        'Backend kiến trúc Event-driven xử lý hàng đợi qua Redis BullMQ',
        'Tích hợp bảo mật webhook bằng thuật toán HMAC-SHA256 xác thực payload',
        'Tự động đồng bộ trạng thái deployment về GitHub Commit Status API'
      ],
      keyFeatures: [
        'Trình soạn thảo quy trình triển khai kéo thả với sơ đồ trực quan',
        'Tự động phát hiện xung đột và rollback tức thì khi phát hiện lỗi HTTP 5xx',
        'Tối ưu hóa Docker layer caching giúp giảm 65% thời gian build container',
        'Báo cáo hiệu năng và thông báo tự động qua Webhook / Telegram / Slack'
      ],
      metrics: [
        { label: 'Thời gian build trung bình', value: '-58%' },
        { label: 'Throughput xử lý song song', value: '120 jobs/min' },
        { label: 'Tỷ lệ triển khai thành công', value: '99.92%' }
      ]
    }
  },
  {
    id: 'aetheria-creative-studio',
    title: 'Aetheria Creative Engine',
    subtitle: 'Không gian sáng tạo tương tác & biên tập đồ họa thời gian thực',
    description: 'Ứng dụng web đồ họa tương tác hiệu năng cao với kết xuất GPU, hỗ trợ xử lý hình ảnh vector, bộ lọc shaders tùy chỉnh và xuất bản đa định dạng cho nhà thiết kế.',
    category: 'web',
    categoryLabel: 'Web App & Sáng tạo',
    tags: ['React', 'Tailwind CSS', 'Framer Motion', 'WebGL', 'Canvas API', 'Vite'],
    year: '2025',
    featured: true,
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    fullCaseStudy: {
      overview: 'Nền tảng hỗ trợ các nhà sáng tạo nội dung tạo các ấn phẩm thị giác chuyển động mượt mà với 60 FPS ngay trong trình duyệt.',
      challenge: 'Thao tác các đối tượng vector phức tạp trên canvas thường gây drop frame và nghẽn Main Thread trên các thiết bị di động tầm trung.',
      solution: 'Chuyển toàn bộ tác vụ render nặng sang Web Workers kết hợp OffscreenCanvas và tối ưu thuật toán spatial indexing Quadtree.',
      architecture: [
        'Giao diện người dùng tối giản với triết lý zero-pill và tỷ lệ màu 60-30-10 sắc nét',
        'Hệ thống rendering đa luồng qua Web Worker & OffscreenCanvas',
        'State management dạng atomic tối ưu re-render ở tần số 120Hz',
        'Bộ lọc xử lý ảnh viết bằng custom GLSL Fragment Shaders'
      ],
      keyFeatures: [
        'Hệ thống timeline keyframe chuyển động mượt mà với đường cong Bezier',
        'Thư viện hiệu ứng hạt particle mô phỏng vật lý chân thực',
        'Xuất file chuẩn WebP, SVG, MP4 trực tiếp không cần qua máy chủ',
        'Tương thích hoàn hảo mọi tỉ lệ màn hình từ smartphone đến màn hình siêu rộng'
      ],
      metrics: [
        { label: 'Khung hình trung bình', value: '60 FPS' },
        { label: 'Bộ nhớ RAM chiếm dụng', value: '< 85 MB' },
        { label: 'Thời gian khởi động trang', value: '0.45s' }
      ]
    }
  },
  {
    id: 'pulsemetrics-dashboard',
    title: 'PulseMetrics Realtime Analytics',
    subtitle: 'Hệ thống giám sát hiệu năng web & telemetry người dùng trực tiếp',
    description: 'Bảng điều khiển phân tích số liệu thời gian thực theo dõi Core Web Vitals, phân phối lưu lượng truy cập và chỉ số phản hồi server với biểu đồ dữ liệu mượt mà.',
    category: 'ai-cloud',
    categoryLabel: 'Cloud & Telemetry',
    tags: ['TypeScript', 'React 19', 'Tailwind CSS', 'WebSockets', 'Chart.js', 'Go'],
    year: '2025',
    featured: false,
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    fullCaseStudy: {
      overview: 'Giải pháp quan sát toàn diện (Observability) giúp các đội ngũ kỹ sư nắm bắt sức khỏe hệ thống và trải nghiệm người dùng cuối trong từng mili-giây.',
      challenge: 'Lượng sự kiện gửi về từ hàng triệu phiên truy cập đồng thời làm quá tải các giải pháp phân tích thông thường.',
      solution: 'Áp dụng cơ chế nén gói tin nhị phân Protobuf qua WebSocket và hiển thị dạng Virtualized Matrix trên client.',
      architecture: [
        'Client React với bộ hiển thị số liệu Tabular Numerals chuẩn xác',
        'Hàng đợi luồng dữ liệu ingest qua Apache Kafka và lưu trữ Time-series',
        'Bộ lọc dữ liệu động đa chiều thực hiện tức thì trên Client-side WebAssembly'
      ],
      keyFeatures: [
        'Cảnh báo sớm đột biến lỗi 4xx/5xx qua thuật toán phát hiện bất thường',
        'Biểu đồ phân tích độ trễ LCP, INP, CLS theo từng vùng địa lý',
        'Chế độ xem phân tích chuyên sâu cho từng Session Replay',
        'Hỗ trợ xuất báo cáo PDF chuẩn báo cáo điều hành'
      ],
      metrics: [
        { label: 'Độ trễ cập nhật dữ liệu', value: '< 80ms' },
        { label: 'Sự kiện xử lý mỗi ngày', value: '14.5M' },
        { label: 'Tối ưu băng thông mạng', value: '-72%' }
      ]
    }
  },
  {
    id: 'devforge-cli-ecosystem',
    title: 'DevForge Scaffold CLI & Engine',
    subtitle: 'Bộ công cụ dòng lệnh tự động hóa khởi tạo dự án chuẩn công nghiệp',
    description: 'CLI thông minh giúp lập trình viên khởi tạo project chuẩn TypeScript, cấu hình sẵn ESLint, Tailwind, Dockerfile và template GitHub Actions CI/CD chỉ bằng 1 câu lệnh.',
    category: 'devtools',
    categoryLabel: 'DevOps & Công cụ',
    tags: ['Node.js', 'TypeScript', 'GitHub Actions', 'Vite', 'Shell', 'npm'],
    year: '2024',
    featured: false,
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    fullCaseStudy: {
      overview: 'Công cụ CLI sinh ra nhằm loại bỏ hàng giờ thiết lập cấu hình lặp đi lặp lại khi bắt đầu dự án mới cho các nhóm phát triển phần mềm.',
      challenge: 'Sự khác biệt giữa các môi trường dev của thành viên thường dẫn đến lỗi "chạy được trên máy tôi nhưng lỗi trên server".',
      solution: 'Chuẩn hóa toàn bộ cấu hình vào các module tái sử dụng, kiểm tra cú pháp nghiêm ngặt và tự động gắn kết pipeline GitHub Pages.',
      architecture: [
        'CLI package biên dịch bằng TypeScript hỗ trợ npx chạy tức thì',
        'Engine sinh file mẫu AST với tính năng dynamic token replacement',
        'Tích hợp kiểm tra git commit hooks qua Husky và lint-staged'
      ],
      keyFeatures: [
        'Tùy chọn preset chỉ với 3 phím bấm mũi tên trực quan',
        'Tự động tạo workflow GitHub Pages tương thích 100% với Vite',
        'Cài đặt tự động các bộ kiểm thử Vitest và Playwright',
        'Hỗ trợ chế độ offline bằng local templates cache'
      ],
      metrics: [
        { label: 'Lượt tải gói npm', value: '45k+' },
        { label: 'Thời gian setup dự án', value: '< 25s' },
        { label: 'Đánh giá GitHub Stars', value: '820+' }
      ]
    }
  },
  {
    id: 'zenith-headless-storefront',
    title: 'Zenith Fast Storefront PWA',
    subtitle: 'Nền tảng thương mại điện tử siêu tốc độ với kiến trúc Headless',
    description: 'Trang mua sắm trực tuyến với điểm Google Lighthouse 100/100, hỗ trợ duyệt offline, thanh toán 1 bước và hiệu ứng chuyển đổi sản phẩm không chớp màn hình.',
    category: 'web',
    categoryLabel: 'Web App & Sáng tạo',
    tags: ['React 19', 'PWA', 'Tailwind CSS', 'Edge API', 'Stripe', 'Framer Motion'],
    year: '2024',
    featured: false,
    demoUrl: 'https://shinikenvin.github.io/my-website/',
    githubUrl: 'https://github.com/shinikenvin/my-website',
    fullCaseStudy: {
      overview: 'Trải nghiệm mua sắm hiện đại giải phóng khách hàng khỏi sự chờ đợi tải trang chậm chạp của các giải pháp CMS cũ.',
      challenge: 'Mỗi 100ms tải trang trễ làm giảm 7% tỷ lệ chuyển đổi đơn hàng và tăng tỷ lệ thoát trang trên điện thoại.',
      solution: 'Áp dụng kiến trúc Jamstack tĩnh hóa kết hợp Edge Functions và Progressive Web App cho trải nghiệm mượt như ứng dụng native.',
      architecture: [
        'Giao diện React với chiến lược Client-side Routing tối ưu prefetching',
        'Service Worker lưu bộ nhớ đệm thông minh cho các tài nguyên tĩnh',
        'Tối ưu hóa hình ảnh AVIF/WebP tự động theo độ phân giải màn hình'
      ],
      keyFeatures: [
        'Bộ lọc sản phẩm đa tiêu chí với phản hồi tức thì không cần reload',
        'Giỏ hàng đồng bộ cục bộ và phục hồi ngay cả khi mất mạng',
        'Chuyển động slide hình ảnh sản phẩm với cử chỉ ngón tay mượt mà',
        'Tối ưu hóa SEO chi tiết với Schema Product và Breadcrumbs tự động'
      ],
      metrics: [
        { label: 'Điểm số Lighthouse', value: '100 / 100' },
        { label: 'Tỉ lệ chuyển đổi đơn', value: '+34%' },
        { label: 'First Contentful Paint', value: '0.4s' }
      ]
    }
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'cicd-github-actions-vite-pages',
    slug: 'trien-khai-cicd-github-actions-cho-vite-github-pages',
    title: 'Xây dựng Pipeline CI/CD GitHub Actions Tự Động Hóa Triển Khai Cho Vite Lên GitHub Pages',
    summary: 'Hướng dẫn chi tiết cách cấu hình GitHub Actions từ con số không: Tự động lint, build, nén tài nguyên và deploy trang web React lên GitHub Pages an toàn mà không cần thao tác thủ công.',
    category: 'DevOps & CI/CD',
    readTime: '6 phút đọc',
    date: '28/09/2026',
    tags: ['GitHub Actions', 'CI/CD', 'GitHub Pages', 'Vite', 'DevOps'],
    likes: 142,
    content: {
      introduction: 'Trong quá trình phát triển web cá nhân hay sản phẩm chuyên nghiệp, việc phải tự build thư mục `dist` rồi upload thủ công lên hosting là một thao tác tốn thời gian và dễ phát sinh sai sót. Bài viết này sẽ hướng dẫn bạn thiết lập một quy trình CI/CD hoàn chỉnh bằng GitHub Actions để mỗi khi bạn gõ `git push origin main`, website sẽ tự động được kiểm tra mã, đóng gói và cập nhật trực tiếp lên URL GitHub Pages của bạn.',
      sections: [
        {
          heading: '1. Hiểu Về Cơ Chế GitHub Actions & GitHub Pages Mới',
          body: 'Trước đây, nhiều dự án dùng tool `gh-pages` để push dist vào nhánh phụ `gh-pages`. Tuy nhiên, GitHub đã cung cấp phương thức chính thức vượt trội hơn: sử dụng GitHub Actions Artifacts kết hợp với môi trường triển khai bảo mật mà không làm ô nhiễm lịch sử git của repo.',
          bulletPoints: [
            'Không cần tạo hoặc quản lý nhánh `gh-pages` trung gian.',
            'Bảo mật với id-token và phân quyền tối thiểu (permissions).',
            'Kiểm tra cú pháp và build failure trước khi cho phép deploy lên live site.'
          ]
        },
        {
          heading: '2. Tệp Cấu Hình Chuẩn `.github/workflows/deploy.yml`',
          body: 'Dưới đây là tệp workflow được tối ưu hóa sẵn bộ nhớ cache npm và hỗ trợ cấu hình base path cho Vite. Bạn chỉ cần đặt file này tại `.github/workflows/deploy.yml` trong thư mục gốc của repository:',
          codeSnippet: {
            language: 'yaml',
            filename: '.github/workflows/deploy.yml',
            code: `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`
          }
        },
        {
          heading: '3. Cấu Hình Đường Dẫn Tương Đối Trong `vite.config.ts`',
          body: 'Khi triển khai lên domain con dạng `https://<username>.github.io/<repo-name>/`, các đường dẫn asset tuyệt đối bắt đầu bằng `/assets/...` sẽ bị lỗi 404 nếu không khai báo `base`. Để đảm bảo tương thích 100% cả ở local và GitHub Pages, hãy dùng cấu hình tương đối:',
          codeSnippet: {
            language: 'typescript',
            filename: 'vite.config.ts',
            code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Sử dụng './' giúp Vite xuất đường dẫn tương đối,
  // chạy hoàn hảo trên mọi đường dẫn con của GitHub Pages
  base: './',
  plugins: [react()],
});`
          }
        },
        {
          heading: '4. Bật Tính Năng GitHub Pages Trong Repository Settings',
          body: 'Để GitHub nhận diện workflow vừa tạo, bạn vào repository trên GitHub: Settings -> Pages -> Tại mục "Build and deployment", mục "Source" hãy đổi từ "Deploy from a branch" sang "GitHub Actions". Từ lúc này, mỗi commit push lên sẽ kích hoạt tự động!',
          bulletPoints: [
            'Bước 1: Vào GitHub Repo -> Settings -> Pages',
            'Bước 2: Mục Source -> Chọn "GitHub Actions"',
            'Bước 3: Push code và xem tiến độ tại tab "Actions"'
          ]
        }
      ],
      conclusion: 'Chỉ với 1 file workflow và cài đặt base path đơn giản, bạn đã sở hữu một hệ thống CI/CD chuẩn quốc tế, giúp quá trình nâng cấp website cá nhân diễn ra hoàn toàn tự động, chuyên nghiệp và đáng tin cậy.'
    }
  },
  {
    id: 'framer-motion-react-19-best-practices',
    slug: 'lam-chu-framer-motion-react-19-chuyen-dong-muot-ma',
    title: 'Làm Chủ Framer Motion Trong React: Hoạt Ảnh Chuyển Trang & Tương Tác 60 FPS Không Giật Lag',
    summary: 'Khám phá các nguyên lý hoạt ảnh giao diện hiện đại: Cách dùng AnimatePresence, layout animation, tối ưu GPU Compositor và nguyên tắc motion tinh tế không gây rối mắt.',
    category: 'Frontend & UI',
    readTime: '7 phút đọc',
    date: '22/09/2026',
    tags: ['React 19', 'Framer Motion', 'UI Design', 'Animation', 'Tailwind CSS'],
    likes: 198,
    content: {
      introduction: 'Hoạt ảnh giao diện (UI Motion) nếu lạm dụng sẽ biến trang web thành một "rạp xiếc" gây mệt mỏi thị giác cho người dùng. Ngược lại, nếu được thiết kế với sự kiềm chế và am hiểu sâu sắc về thời gian phản hồi (Interaction Latency Budget), hoạt ảnh sẽ tạo cảm giác ứng dụng phản hồi sống động, cao cấp và mượt mà.',
      sections: [
        {
          heading: '1. Quy Tắc Vàng Về Độ Trễ & Thời Gian Chuyển Động',
          body: 'Mọi tương tác bấm nút, hover hay mở menu đều phải hoàn tất trong khoảng thời gian từ 150ms đến 250ms. Nếu kéo dài quá 300ms, người dùng sẽ cảm thấy giao diện bị ì ạch.',
          bulletPoints: [
            'Hover & Micro-interactions: 100ms – 180ms với đường cong cubic-bezier(0.16, 1, 0.3, 1)',
            'Chuyển tab / Modal mở: 200ms – 300ms',
            'Chỉ chuyển động các thuộc tính GPU compositor: transform (x, y, scale) và opacity'
          ]
        },
        {
          heading: '2. Mẫu Chuyển Trang Mượt Mà Với AnimatePresence',
          body: 'Sử dụng mode="wait" kết hợp với các biến số chuyển trạng thái (variants) để trang cũ nhẹ nhàng mờ đi trước khi trang mới trượt lên:',
          codeSnippet: {
            language: 'tsx',
            filename: 'PageTransition.tsx',
            code: `import { motion, AnimatePresence } from 'motion/react';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: 0.18, ease: 'easeIn' } 
  }
};

export function PageContainer({ activeKey, children }: { activeKey: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}`
          }
        },
        {
          heading: '3. Tuân Thủ Chuẩn Tiếp Cận Prefers-Reduced-Motion',
          body: 'Không phải người dùng nào cũng thích hoặc cảm thấy thoải mái với các chuyển động di chuyển lớn trên màn hình. Luôn tôn trọng cài đặt hệ thống của người dùng bằng cách giảm biên độ dao động khi có tín hiệu prefers-reduced-motion.',
          bulletPoints: [
            'Thay thế chuyển động trượt (translate) bằng hiệu ứng mờ dần nhẹ (fade-in)',
            'Giữ nguyên tính năng, chỉ triệt tiêu gia tốc chuyển động vật lý'
          ]
        }
      ],
      conclusion: 'Sự mượt mà trong giao diện hiện đại không nằm ở việc nhồi nhét thật nhiều hiệu ứng, mà ở tính nhất quán, gia tốc tự nhiên và phản hồi nhanh chóng ngay dưới đầu ngón tay của người dùng.'
    }
  },
  {
    id: 'anti-ai-slop-ui-design-constitution',
    slug: 'thiet-ke-frontend-chong-ai-slop-va-chuan-muc-hien-dai',
    title: 'Kiến Trúc Frontend Hiện Đại: Tư Duy Thiết Kế Chống "AI Slop" & Định Hình Gu Thẩm Mỹ Cá Nhân',
    summary: 'Tại sao các website do AI sinh ra thường trông na ná nhau với nền tím mờ ảo và capsule pills? Phân tích quy tắc Zero-Pill, tỷ lệ màu 60-30-10 và phân cấp typography chuyên nghiệp.',
    category: 'Kiến trúc & Design',
    readTime: '8 phút đọc',
    date: '15/09/2026',
    tags: ['Design System', 'Typography', 'Anti-Slop', 'Tailwind CSS', 'Clean Code'],
    likes: 215,
    content: {
      introduction: 'Với sự bùng nổ của các mô hình AI tạo code, hàng ngàn website xuất hiện với cùng một diện mạo đơn điệu: viền thẻ bo tròn màu tím gradient lòe loẹt, hàng chục viên thuốc (pills/badges) đóng khung mọi mẩu thông tin, và các con số đánh giá vô căn cứ. Làm thế nào để một lập trình viên tạo ra sản phẩm thể hiện gu thẩm mỹ tinh tế và sự chuyên nghiệp thực thụ?',
      sections: [
        {
          heading: '1. Kỷ Luật Zero-Pill: Giải Phóng Metadata Khỏi Hộp Đóng Khung',
          body: 'Thông tin tĩnh như ngày đăng, tác giả, thời gian đọc hay thẻ phân loại nên được hiển thị dưới dạng văn bản tĩnh tinh tế, phân tách bằng các ký tự typographic như dấu chấm ở giữa (·) hoặc dấu gạch chéo (/), thay vì bọc trong từng viên thuốc màu mè.',
          bulletPoints: [
            'Sai: Đóng khung ngày tháng trong border rounded-full xám',
            'Đúng: 15/09/2026 · 8 phút đọc · Kiến trúc phần mềm',
            'Ngoại lệ duy nhất: Các nút bấm lọc (filter tabs) có thể click để đổi trạng thái'
          ]
        },
        {
          heading: '2. Tỷ Lệ Phân Phối Màu 60 - 30 - 10',
          body: 'Một giao diện đẳng cấp luôn duy trì sự điềm đạm. Hãy chia ngân sách màu sắc nghiêm ngặt:',
          bulletPoints: [
            '60% Nền Canvas Trung Tính: Slate đậm (#090d16) hoặc kem ấm cao cấp, không dùng màu loang tím ngẫu nhiên.',
            '30% Bề Mặt Cấu Trúc: Các khối nội dung phân cách bằng viền mảnh (hairline border) và khoảng cách whitespace thoáng đãng.',
            '10% Điểm Nhấn Trọng Tâm: Màu sắc nổi bật (cyan, cobalt, hoặc emerald) chỉ dành riêng cho nút CTA chính và tab đang chọn.'
          ]
        },
        {
          heading: '3. Phân Cấp Typography: Quy Tắc 2+1 Phông Chữ',
          body: 'Không dùng quá 2 họ phông chữ chính cho toàn bộ trang web (1 phông tiêu đề cá tính + 1 phông chữ thân bài dễ đọc), cộng thêm tối đa 1 phông monospace chỉ dành riêng cho số liệu (tabular-nums) và code terminal.',
          bulletPoints: [
            'Áp dụng text-wrap: balance cho các tiêu đề để không bị rớt một từ lẻ loi xuống dòng mới.',
            'Dùng font-variant-numeric: tabular-nums cho mọi bảng số liệu và thời gian để thẳng hàng theo trục dọc.'
          ]
        }
      ],
      conclusion: 'Thiết kế đẹp là thiết kế biết loại bỏ những thứ thừa thãi. Khi bạn tôn trọng khoảng trắng, sự rõ ràng của chữ viết và trải nghiệm người dùng, trang web của bạn sẽ tự khắc toát lên đẳng cấp của một kỹ sư xuất sắc.'
    }
  },
  {
    id: 'optimize-core-web-vitals-react-tailwind',
    slug: 'toi-uu-core-web-vitals-react-tailwind-v4',
    title: 'Tối Ưu Hóa Core Web Vitals: Bí Quyết Đạt Điểm 100/100 Lighthouse Cho Ứng Dụng React',
    summary: 'Phân tích chiến lược nén gói JavaScript, loại bỏ render blocking CSS, tối ưu chỉ số LCP & CLS và triển khai caching tài nguyên hiệu quả trên CDN.',
    category: 'Hiệu năng & Tối ưu',
    readTime: '5 phút đọc',
    date: '08/09/2026',
    tags: ['Performance', 'Core Web Vitals', 'React', 'Lighthouse', 'Vite'],
    likes: 167,
    content: {
      introduction: 'Tốc độ tải trang là yếu tố sống còn quyết định trải nghiệm người dùng và thứ hạng SEO. Một website tải nhanh dưới 1 giây tạo nên ấn tượng chuyên nghiệp ngay từ khoảnh khắc đầu tiên người tuyển dụng hoặc khách hàng truy cập.',
      sections: [
        {
          heading: '1. Chiến Lược Giảm Kích Thước Bundle Với Code Splitting',
          body: 'Sử dụng React.lazy và dynamic import để chỉ tải các module lớn (như modals, biểu đồ, trình đọc bài viết) khi người dùng thực sự kích hoạt tương tác, thay vì tải toàn bộ ngay từ lần đầu.',
          bulletPoints: [
            'Tách các thư viện nặng ra khỏi chunk chính của ứng dụng',
            'Sử dụng các icon dạng SVG inline hoặc import rời từ lucide-react',
            'Kiểm tra kích thước build qua rollup-plugin-visualizer'
          ]
        },
        {
          heading: '2. Tối Ưu Tailwind CSS v4 & Loại Bỏ CSS Dư Thừa',
          body: 'Tailwind v4 với engine Rust mới xử lý biên dịch trực tiếp chỉ những lớp CSS thực sự sử dụng, giúp dung lượng stylesheet giảm chỉ còn vài chục kilobyte và không làm chậm quá trình render ban đầu (FCP).',
          codeSnippet: {
            language: 'css',
            filename: 'src/index.css',
            code: `@import "tailwindcss";

/* Tối ưu render font chữ và cuộn trang */
@layer base {
  html {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
}`
          }
        },
        {
          heading: '3. Triệt Tiêu Cumulative Layout Shift (CLS)',
          body: 'Luôn định sẵn tỉ lệ khung hình (aspect-ratio) hoặc chiều cao cố định cho các container chứa hình ảnh và component động trước khi chúng tải xong, ngăn chặn hiện tượng giật cục khung nhìn khi lướt web.',
          bulletPoints: [
            'Đặt aspect-ratio rõ ràng cho hình ảnh hoặc container demo',
            'Không chèn dynamic banner đẩy lùi nội dung đang đọc'
          ]
        }
      ],
      conclusion: 'Hiệu năng cao không phải là một công đoạn thêm vào sau cùng, mà là một thói quen lập trình được xây dựng từ cấu trúc thư mục, cách viết component và quản lý tài nguyên.'
    }
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    company: 'TechCraft Solutions',
    role: 'Senior Full-Stack Engineer / Team Lead',
    period: '2024 — Hiện tại',
    location: 'Việt Nam & Remote',
    description: 'Dẫn dắt phát triển hệ thống web phân tán, thiết kế kiến trúc frontend quy mô lớn, tối ưu hóa pipeline CI/CD và nâng cấp trải nghiệm người dùng trên các sản phẩm SaaS.',
    highlights: [
      'Tái cấu trúc hệ thống frontend từ monolith sang micro-frontends, giúp tăng tốc độ build lên 4.2 lần',
      'Xây dựng hệ thống CI/CD chuẩn hóa với GitHub Actions, giảm 70% lỗi phát sinh trong quá trình release',
      'Đạt chuẩn tiếp cận WCAG AA và tối ưu Core Web Vitals đạt điểm số Lighthouse 98+'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Docker', 'GitHub Actions', 'Node.js', 'System Architecture']
  },
  {
    company: 'Vanguard Digital Agency',
    role: 'Frontend & Interactive Web Developer',
    period: '2022 — 2024',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    description: 'Phát triển các ứng dụng web tương tác cao, thiết kế giao diện theo chuẩn thiết kế quốc tế và tích hợp các API thanh toán, quản lý dữ liệu đám mây.',
    highlights: [
      'Phát triển hơn 15+ dự án web thương mại và dashboard quản trị đạt chuẩn hiệu năng cao',
      'Xây dựng thư viện component nội bộ tái sử dụng cho 6 dự án thành viên',
      'Cải thiện tỷ lệ giữ chân người dùng thêm 32% nhờ tích hợp hiệu ứng chuyển động mượt mà với Framer Motion'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API', 'GraphQL', 'Vite']
  },
  {
    company: 'OpenSource Labs',
    role: 'Open-Source Contributor & Junior Developer',
    period: '2021 — 2022',
    location: 'Remote',
    description: 'Đóng góp mã nguồn cho các công cụ lập trình web, viết tài liệu kỹ thuật và tham gia xây dựng các tiện ích mở rộng cho cộng đồng developer.',
    highlights: [
      'Đóng góp hơn 50+ PRs cho các repository mã nguồn mở phổ biến',
      'Viết các bài blog kỹ thuật hướng dẫn lập trình viên mới bắt đầu với React và Git'
    ],
    skills: ['JavaScript', 'HTML5/CSS3', 'Git/GitHub', 'Node.js', 'Linux']
  }
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Frontend & UI Engineering',
    description: 'Xây dựng giao diện trực quan, dễ tiếp cận và hiệu năng mượt mà',
    skills: [
      { name: 'React 19 / Next.js', level: 95, experience: '4 năm', highlight: true },
      { name: 'TypeScript', level: 92, experience: '4 năm', highlight: true },
      { name: 'Tailwind CSS (v3 / v4)', level: 96, experience: '4 năm', highlight: true },
      { name: 'Framer Motion & Animations', level: 90, experience: '3 năm', highlight: true },
      { name: 'Vite & Modern Bundlers', level: 92, experience: '3 năm' },
      { name: 'State Management (Zustand, Redux)', level: 88, experience: '3 năm' },
      { name: 'WebGL / Canvas 2D API', level: 78, experience: '2 năm' },
      { name: 'Responsive & PWA Development', level: 94, experience: '4 năm' }
    ]
  },
  {
    title: 'Backend & Cloud Services',
    description: 'Thiết kế API an toàn, xử lý dữ liệu và hệ thống phân tán',
    skills: [
      { name: 'Node.js & Express / NestJS', level: 88, experience: '3 năm', highlight: true },
      { name: 'RESTful API & GraphQL', level: 90, experience: '4 năm' },
      { name: 'PostgreSQL / MySQL', level: 84, experience: '3 năm' },
      { name: 'Redis Caching & Queue', level: 82, experience: '2 năm' },
      { name: 'Cloudflare Workers / Edge', level: 80, experience: '2 năm' },
      { name: 'WebSockets & Realtime SSE', level: 86, experience: '3 năm' }
    ]
  },
  {
    title: 'DevOps, CI/CD & Công Cụ',
    description: 'Tự động hóa triển khai, kiểm thử và quản trị mã nguồn',
    skills: [
      { name: 'GitHub Actions & Workflows', level: 94, experience: '3 năm', highlight: true },
      { name: 'Git & Version Control', level: 95, experience: '4 năm', highlight: true },
      { name: 'Docker & Containerization', level: 82, experience: '2 năm' },
      { name: 'GitHub Pages & Vercel Deploy', level: 98, experience: '4 năm', highlight: true },
      { name: 'Linux / Bash Scripting', level: 85, experience: '3 năm' },
      { name: 'Vitest / Jest / Testing Library', level: 84, experience: '3 năm' }
    ]
  }
];

export const WORKFLOW_SNIPPET = `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;
