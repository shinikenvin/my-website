import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  short: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', short: 'VI' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳', short: 'ZH' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
];

export const TRANSLATIONS = {
  vi: {
    nav: {
      overview: 'Tổng quan',
      projects: 'Dự án',
      blog: 'Blog kỹ thuật',
      skills: 'Kỹ năng & Kinh nghiệm',
      contact: 'Liên hệ',
      cicd: 'CI/CD Deploy',
      github: 'GitHub',
    },
    hero: {
      statusBadge: 'Sẵn sàng nhận dự án mới',
      role: 'Kỹ Sư Phần Mềm Full-Stack',
      titlePrefix: 'Kiến tạo trải nghiệm số',
      titleHighlight: 'với hiệu năng đỉnh cao',
      titleSuffix: '& tư duy sản phẩm chuyên sâu.',
      intro: 'Chào bạn, mình là Vin (shinikenvin). Chuyên xây dựng các ứng dụng web hiện đại, kiến trúc đám mây ổn định, quy trình CI/CD tự động và giao diện người dùng đạt chuẩn quốc tế.',
      ctaProjects: 'Xem Dự Án Thực Chiến',
      ctaContact: 'Liên Hệ Ngay',
      yearsExp: 'Năm kinh nghiệm',
      completedProjects: 'Dự án bàn giao',
      serviceUptime: 'Uptime hệ thống',
    },
    projects: {
      badge: 'Dự án tiêu biểu',
      title: 'Các Sản Phẩm Thực Tế & Nghiên Cứu Chuyên Sâu',
      subtitle: 'Tuyển tập những giải pháp phần mềm được tối ưu hiệu năng cao nhất, từ ứng dụng web thời gian thực tới kiến trúc hệ thống phân tán.',
      filterAll: 'Tất cả dự án',
      viewDetails: 'Xem chi tiết kiến trúc',
      liveDemo: 'Trải nghiệm trực tiếp',
      sourceCode: 'Mã nguồn GitHub',
      featuredTag: 'Dự án nổi bật',
    },
    blog: {
      badge: 'Góc chia sẻ kỹ thuật',
      title: 'Kiến Thức Chuyên Sâu & Tư Duy Kỹ Sư',
      subtitle: 'Các bài phân tích thực tế về tối ưu hóa hiệu năng, thiết kế giao diện chống AI-slop và xây dựng quy trình CI/CD tự động.',
      readMore: 'Đọc bài phân tích',
      readTimeSuffix: 'đọc',
      publishedOn: 'Đăng ngày',
    },
    about: {
      badge: 'Năng lực cốt lõi',
      title: 'Bộ Kỹ Năng & Lộ Trình Phát Triển Chuyên Môn',
      subtitle: 'Làm chủ toàn diện từ thiết kế giao diện tinh tế, lập trình logic phía máy chủ đến tối ưu hóa hạ tầng đám mây.',
      tabSkills: 'Kỹ năng công nghệ',
      tabExperience: 'Kinh nghiệm làm việc',
      tabPhilosophy: 'Triết lý kỹ thuật',
      levelExpert: 'Chuyên sâu',
      levelAdvanced: 'Thành thạo',
      levelIntermediate: 'Thực chiến tốt',
    },
    contact: {
      badge: 'Kết nối & Hợp tác',
      title: 'Bắt Đầu Dự Án Hoặc Trao Đổi Cơ Hội Mới',
      subtitle: 'Tôi luôn sẵn sàng thảo luận về các giải pháp công nghệ, dự án phần mềm đột phá hoặc cơ hội hợp tác kỹ thuật lâu dài.',
      nameLabel: 'Họ và tên',
      namePlaceholder: 'Nguyễn Văn A',
      emailLabel: 'Địa chỉ Email',
      emailPlaceholder: 'name@example.com',
      subjectLabel: 'Chủ đề trao đổi',
      subjectPlaceholder: 'Phát triển dự án Web / Tư vấn kỹ thuật...',
      messageLabel: 'Nội dung tin nhắn',
      messagePlaceholder: 'Mô tả ngắn gọn về nhu cầu hoặc ý tưởng của bạn...',
      sendBtn: 'Gửi Tin Nhắn Trực Tiếp',
      sending: 'Đang gửi tin nhắn...',
      sentSuccess: 'Gửi tin nhắn thành công! Tôi sẽ phản hồi sớm nhất.',
      directContact: 'Kênh liên hệ trực tiếp',
      responseSpeed: 'Phản hồi trong vòng 2-4 giờ làm việc',
    },
    footer: {
      rights: 'Bản quyền nội dung thuộc về Shinikenvin.',
      builtWith: 'Được xây dựng với React, TypeScript, Tailwind CSS & triển khai tự động qua GitHub Actions.',
      quickLinks: 'Điều hướng nhanh',
      social: 'Mạng xã hội & Cộng đồng',
    },
    cicd: {
      title: 'Quy Trình Triển Khai Tự Động CI/CD',
      subtitle: 'Tự động hóa hoàn toàn với GitHub Actions & GitHub Pages',
      activeStatus: 'Đang hoạt động',
      officialAddress: 'Địa chỉ website chính thức',
      instantUpdate: 'Cập nhật tức thì sau mỗi commit',
      pipelineArch: 'Sơ đồ chuỗi cung ứng tự động (Pipeline Architecture)',
      fourStages: '4 Giai đoạn tự động',
      standards: 'Tiêu chuẩn vận hành & Độ tin cậy',
      howItWorks: 'Cơ chế hoạt động khi bạn phát triển website',
      howItWorks1: 'Mỗi khi bạn thực hiện thay đổi và gửi lên GitHub, máy chủ đám mây sẽ lập tức nhận biết và bắt đầu đóng gói dự án.',
      howItWorks2: 'Toàn bộ quy trình diễn ra hoàn toàn trên nền tảng đám mây, không chiếm tài nguyên máy tính cá nhân.',
      howItWorks3: 'Không cần cấu hình hosting phức tạp — đường dẫn GitHub Pages luôn sẵn sàng với chứng chỉ bảo mật SSL.',
      connectedRepo: 'Đã kết nối với kho lưu trữ shinikenvin/my-website',
      close: 'Đóng',
      visitWebsite: 'Truy cập Website',
    }
  },
  en: {
    nav: {
      overview: 'Overview',
      projects: 'Projects',
      blog: 'Engineering Blog',
      skills: 'Skills & Journey',
      contact: 'Contact',
      cicd: 'CI/CD Deploy',
      github: 'GitHub',
    },
    hero: {
      statusBadge: 'Available for new projects',
      role: 'Full-Stack Software Engineer',
      titlePrefix: 'Crafting digital experiences',
      titleHighlight: 'with peak performance',
      titleSuffix: '& deep product mindset.',
      intro: 'Hi, I am Vin (shinikenvin). Specializing in modern web applications, scalable cloud architecture, automated CI/CD pipelines, and high-performance interfaces.',
      ctaProjects: 'Explore Production Work',
      ctaContact: 'Get in Touch',
      yearsExp: 'Years Experience',
      completedProjects: 'Completed Projects',
      serviceUptime: 'System Uptime',
    },
    projects: {
      badge: 'Featured Projects',
      title: 'Production Systems & Applied Research',
      subtitle: 'A curated collection of highly optimized software solutions, from real-time web applications to distributed cloud architectures.',
      filterAll: 'All Projects',
      viewDetails: 'View Architecture Details',
      liveDemo: 'Live Experience',
      sourceCode: 'GitHub Source',
      featuredTag: 'Featured Project',
    },
    blog: {
      badge: 'Engineering Insights',
      title: 'Deep Dives & Engineering Mindset',
      subtitle: 'Practical case studies on performance optimization, anti-AI-slop UI design discipline, and CI/CD pipelines.',
      readMore: 'Read Article',
      readTimeSuffix: 'read',
      publishedOn: 'Published on',
    },
    about: {
      badge: 'Core Competencies',
      title: 'Technical Skills & Professional Journey',
      subtitle: 'Comprehensive mastery from refined UI craftsmanship and resilient backend logic to cloud infrastructure optimization.',
      tabSkills: 'Technology Stack',
      tabExperience: 'Work Experience',
      tabPhilosophy: 'Engineering Philosophy',
      levelExpert: 'Expert',
      levelAdvanced: 'Proficient',
      levelIntermediate: 'Solid Hands-on',
    },
    contact: {
      badge: 'Connect & Collaborate',
      title: 'Start a Project or Discuss New Opportunities',
      subtitle: 'Always open to discussing high-impact technology solutions, ambitious software projects, or engineering roles.',
      nameLabel: 'Your Name',
      namePlaceholder: 'John Doe',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Web Application Development / Consulting...',
      messageLabel: 'Message',
      messagePlaceholder: 'Briefly describe your requirements or ideas...',
      sendBtn: 'Send Message',
      sending: 'Sending message...',
      sentSuccess: 'Message sent successfully! I will reply as soon as possible.',
      directContact: 'Direct Channels',
      responseSpeed: 'Response within 2-4 business hours',
    },
    footer: {
      rights: 'All rights reserved by Shinikenvin.',
      builtWith: 'Built with React, TypeScript, Tailwind CSS & automatically deployed via GitHub Actions.',
      quickLinks: 'Quick Navigation',
      social: 'Social & Community',
    },
    cicd: {
      title: 'Automated CI/CD Deployment Pipeline',
      subtitle: 'Fully automated with GitHub Actions & GitHub Pages',
      activeStatus: 'Active & Ready',
      officialAddress: 'Official Website Address',
      instantUpdate: 'Instantly updated on every commit',
      pipelineArch: 'Pipeline Architecture Overview',
      fourStages: '4 Automated Stages',
      standards: 'Operational Standards & Reliability',
      howItWorks: 'How it works during development',
      howItWorks1: 'Whenever you push code changes to GitHub, the cloud runner immediately triggers the build and optimization pipeline.',
      howItWorks2: 'The entire workflow executes in an isolated cloud environment without consuming local system resources.',
      howItWorks3: 'Zero hosting configuration needed — your GitHub Pages domain is always live with automatic SSL/HTTPS encryption.',
      connectedRepo: 'Connected to repository shinikenvin/my-website',
      close: 'Close',
      visitWebsite: 'Visit Website',
    }
  },
  ja: {
    nav: {
      overview: '概要',
      projects: 'プロジェクト',
      blog: '技術ブログ',
      skills: 'スキル＆経歴',
      contact: 'お問い合わせ',
      cicd: 'CI/CDデプロイ',
      github: 'GitHub',
    },
    hero: {
      statusBadge: '新規プロジェクト相談受付中',
      role: 'フルスタック ソフトウェアエンジニア',
      titlePrefix: 'デジタル体験を創造する',
      titleHighlight: '圧倒的なパフォーマンスと',
      titleSuffix: '洗練されたプロダクト思考。',
      intro: 'はじめまして、Vin（shinikenvin）です。モダンWebアプリケーション、安定したクラウド設計、CI/CD自動化、国際基準のUI/UX開発を専門としています。',
      ctaProjects: '制作実績を見る',
      ctaContact: 'お問い合わせ',
      yearsExp: '年の実務経験',
      completedProjects: '納品プロジェクト',
      serviceUptime: 'システム稼働率',
    },
    projects: {
      badge: '注目プロジェクト',
      title: '制作実績＆実践的エンジニアリング',
      subtitle: 'リアルタイムWebアプリから分散システムまで、最高峰のパフォーマンスを追求したソフトウェア実績集。',
      filterAll: 'すべてのプロジェクト',
      viewDetails: 'アーキテクチャ詳細',
      liveDemo: 'ライブデモを体験',
      sourceCode: 'GitHubソースコード',
      featuredTag: 'おすすめ',
    },
    blog: {
      badge: '技術的知見',
      title: '技術深掘り＆エンジニアリング思考',
      subtitle: 'パフォーマンス最適化、高品質UIデザイン規律、自動CI/CD構築に関する実践的解説。',
      readMore: '記事を読む',
      readTimeSuffix: 'で読める',
      publishedOn: '公開日',
    },
    about: {
      badge: 'コアコンピタンス',
      title: '技術スタック＆キャリアロードマップ',
      subtitle: '美しいUIデザインから堅牢なサーバーロジック、クラウドインフラ最適化まで一貫して支援。',
      tabSkills: '技術スタック',
      tabExperience: '職務経歴',
      tabPhilosophy: '開発哲学',
      levelExpert: 'エキスパート',
      levelAdvanced: '上級・実務精通',
      levelIntermediate: '実践力あり',
    },
    contact: {
      badge: 'お問い合わせ・協業',
      title: 'プロジェクトの相談・新たな機会',
      subtitle: 'Web開発のご依頼、技術コンサルティング、新規案件についていつでもお気軽にご相談ください。',
      nameLabel: 'お名前',
      namePlaceholder: '山田 太郎',
      emailLabel: 'メールアドレス',
      emailPlaceholder: 'name@example.com',
      subjectLabel: '件名',
      subjectPlaceholder: 'Webアプリケーション開発のご相談...',
      messageLabel: 'メッセージ内容',
      messagePlaceholder: 'ご要望やアイデアをお気軽にご記入ください...',
      sendBtn: 'メッセージを送信',
      sending: '送信中...',
      sentSuccess: '送信完了しました！迅速にご返信いたします。',
      directContact: '直接のお問い合わせ窓口',
      responseSpeed: '通常2〜4営業時間内にご返答',
    },
    footer: {
      rights: 'Shinikenvin 無断転載を禁じます。',
      builtWith: 'React、TypeScript、Tailwind CSSで構築、GitHub Actionsで自動デプロイ。',
      quickLinks: 'クイックリンク',
      social: 'ソーシャル＆コミュニティ',
    },
    cicd: {
      title: 'CI/CD 自動デプロイパイプライン',
      subtitle: 'GitHub Actions ＆ GitHub Pages による完全自動化',
      activeStatus: '稼働中・スタンバイ完了',
      officialAddress: '公式Webサイトアドレス',
      instantUpdate: 'コミットごとに即時自動更新',
      pipelineArch: '自動化パイプラインアーキテクチャ',
      fourStages: '4つの自動化ステージ',
      standards: '運用基準と高信頼性',
      howItWorks: '開発ワークフローの仕組み',
      howItWorks1: 'GitHubにプッシュするだけで、クラウド上のランナーが自動検知してビルドと最適化を開始します。',
      howItWorks2: '全工程が隔離されたクラウド環境で実行されるため、ローカルPCのリソースを消費しません。',
      howItWorks3: '煩雑なサーバー設定は不要。常に最新のSSL/HTTPS暗号化済みGitHub Pagesへ即時反映されます。',
      connectedRepo: 'shinikenvin/my-website リポジトリに接続済み',
      close: '閉じる',
      visitWebsite: 'Webサイトを開く',
    }
  },
  ko: {
    nav: {
      overview: '개요',
      projects: '프로젝트',
      blog: '기술 블로그',
      skills: '기술 & 경력',
      contact: '문의하기',
      cicd: 'CI/CD 배포',
      github: 'GitHub',
    },
    hero: {
      statusBadge: '신규 프로젝트 협업 가능',
      role: '풀스택 소프트웨어 엔지니어',
      titlePrefix: '디지털 경험을 창조합니다',
      titleHighlight: '최고의 성능과',
      titleSuffix: '정교한 프로덕트 마인드셋으로.',
      intro: '안녕하세요, Vin (shinikenvin)입니다. 최신 웹 애플리케이션 개발, 안정적인 클라우드 아키텍처, 자동화된 CI/CD 파이프라인 및 글로벌 표준 UI/UX를 전문으로 제작합니다.',
      ctaProjects: '프로젝트 둘러보기',
      ctaContact: '문의하기',
      yearsExp: '년 경력',
      completedProjects: '완료 프로젝트',
      serviceUptime: '서비스 가동률',
    },
    projects: {
      badge: '주요 프로젝트',
      title: '실제 제작 및 심층 연구 프로젝트',
      subtitle: '실시간 웹 애플리케이션부터 분산 시스템까지 최고 성능으로 최적화된 포트폴리오 모음입니다.',
      filterAll: '전체 프로젝트',
      viewDetails: '상세 아키텍처 보기',
      liveDemo: '라이브 데모 체험',
      sourceCode: 'GitHub 소스코드',
      featuredTag: '대표 프로젝트',
    },
    blog: {
      badge: '엔지니어링 인사이트',
      title: '심층 기술 분석 & 엔지니어 마인드셋',
      subtitle: '성능 최적화, 정교한 프론트엔드 디자인 원칙 및 자동화된 CI/CD 파이프라인 구축에 관한 심층 분석 글입니다.',
      readMore: '글 읽기',
      readTimeSuffix: '소요',
      publishedOn: '게시일',
    },
    about: {
      badge: '핵심 역량',
      title: '기술 스택 & 전문 역량 로드맵',
      subtitle: '정교한 UI 디자인부터 백엔드 비즈니스 로직, 클라우드 인프라 최적화까지 종합적인 기술을 지원합니다.',
      tabSkills: '기술 스택',
      tabExperience: '경력 사항',
      tabPhilosophy: '엔지니어링 철학',
      levelExpert: '전문가 수준',
      levelAdvanced: '숙련됨',
      levelIntermediate: '실전 응용 가능',
    },
    contact: {
      badge: '협업 및 문의',
      title: '신규 프로젝트 의뢰 및 협업 논의',
      subtitle: '혁신적인 소프트웨어 개발, 기술 컨설팅 또는 적합한 엔지니어링 포지션에 대해 언제든 열려 있습니다.',
      nameLabel: '성함',
      namePlaceholder: '홍길동',
      emailLabel: '이메일 주소',
      emailPlaceholder: 'name@example.com',
      subjectLabel: '문의 주제',
      subjectPlaceholder: '웹 애플리케이션 개발 문의...',
      messageLabel: '문의 내용',
      messagePlaceholder: '프로젝트 요구사항이나 아이디어를 자유롭게 작성해주세요...',
      sendBtn: '메시지 전송',
      sending: '전송 중...',
      sentSuccess: '메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.',
      directContact: '직접 문의 채널',
      responseSpeed: '영업일 기준 2~4시간 이내 회신',
    },
    footer: {
      rights: 'Shinikenvin. 모든 권리 보유.',
      builtWith: 'React, TypeScript, Tailwind CSS로 구축되었으며 GitHub Actions로 자동 배포됩니다.',
      quickLinks: '빠른 탐색',
      social: '소셜 & 커뮤니티',
    },
    cicd: {
      title: 'CI/CD 자동 배포 파이프라인',
      subtitle: 'GitHub Actions 및 GitHub Pages 기반의 완전 자동화',
      activeStatus: '정상 가동 중',
      officialAddress: '공식 웹사이트 주소',
      instantUpdate: '커밋마다 즉시 자동 반영',
      pipelineArch: '파이프라인 자동화 아키텍처',
      fourStages: '4단계 자동화 구성',
      standards: '운영 기준 및 안정성 지표',
      howItWorks: '개발 시 동작 방식',
      howItWorks1: 'GitHub로 코드를 푸시하면 클라우드 러너가 즉시 감지하여 빌드 및 최적화 작업을 자동으로 시작합니다.',
      howItWorks2: '모든 과정은 격리된 클라우드 환경에서 실행되어 로컬 PC 리소스를 사용하지 않습니다.',
      howItWorks3: '복잡한 호스팅 설정 없이 항상 SSL/HTTPS로 암호화된 GitHub Pages로 즉각 반영됩니다.',
      connectedRepo: 'shinikenvin/my-website 저장소와 연동됨',
      close: '닫기',
      visitWebsite: '웹사이트 방문',
    }
  },
  zh: {
    nav: {
      overview: '概览',
      projects: '核心项目',
      blog: '技术专栏',
      skills: '技术与经历',
      contact: '联系我',
      cicd: 'CI/CD 部署',
      github: 'GitHub',
    },
    hero: {
      statusBadge: '承接新项目与合作',
      role: '全栈软件开发工程师',
      titlePrefix: '打造卓越数字体验',
      titleHighlight: '极致流畅性能',
      titleSuffix: '与深度工程思维。',
      intro: '你好，我是 Vin (shinikenvin)。专注于现代 Web 应用开发、高可用云架构、自动化 CI/CD 流水线以及国际化 UI/UX 体验。',
      ctaProjects: '探索实战项目',
      ctaContact: '立即联系',
      yearsExp: '年开发经验',
      completedProjects: '已交付项目',
      serviceUptime: '系统运行率',
    },
    projects: {
      badge: '代表性成果',
      title: '实战项目与深度工程化探索',
      subtitle: '精选针对极致性能与可靠性深度优化的软件解决方案，涵盖实时 Web 应用与分布式云架构。',
      filterAll: '全部项目',
      viewDetails: '查看架构细节',
      liveDemo: '在线体验',
      sourceCode: 'GitHub 源码',
      featuredTag: '精选项目',
    },
    blog: {
      badge: '技术专栏',
      title: '深度解析与工程思维',
      subtitle: '分享关于前端性能极致优化、无冗余 UI 设计规范以及自动化 CI/CD 构建的实战经验。',
      readMore: '阅读全文',
      readTimeSuffix: '阅读',
      publishedOn: '发布于',
    },
    about: {
      badge: '核心能力',
      title: '技术图谱与专业成长轨迹',
      subtitle: '兼具优雅细腻的前端设计功底、稳健的高并发服务端逻辑与弹性云原生基础设施构建能力。',
      tabSkills: '技术栈',
      tabExperience: '工作经历',
      tabPhilosophy: '工程哲学',
      levelExpert: '精通 / 专家',
      levelAdvanced: '熟练 / 深入',
      levelIntermediate: '良好实战',
    },
    contact: {
      badge: '连接与合作',
      title: '开启新项目合作或交流契机',
      subtitle: '随时欢迎探讨创新型软件开发、系统架构咨询或全栈工程合作机会。',
      nameLabel: '您的姓名',
      namePlaceholder: '张三',
      emailLabel: '电子邮箱',
      emailPlaceholder: 'name@example.com',
      subjectLabel: '交流主题',
      subjectPlaceholder: 'Web 应用开发合作 / 架构咨询...',
      messageLabel: '留言内容',
      messagePlaceholder: '请简要描述您的需求或项目构想...',
      sendBtn: '直接发送消息',
      sending: '正在发送...',
      sentSuccess: '消息发送成功！我将尽快给您回复。',
      directContact: '直接联系方式',
      responseSpeed: '通常在 2-4 个工作小时内回复',
    },
    footer: {
      rights: 'Shinikenvin 版权所有。',
      builtWith: '基于 React、TypeScript 与 Tailwind CSS 构建，并通过 GitHub Actions 自动化持续部署。',
      quickLinks: '快速导航',
      social: '社交与社区',
    },
    cicd: {
      title: 'CI/CD 自动化部署流水线',
      subtitle: '基于 GitHub Actions 与 GitHub Pages 的全自动持续交付',
      activeStatus: '正常运行中',
      officialAddress: '官方线上地址',
      instantUpdate: '每次提交即时自动更新',
      pipelineArch: '自动化流水线架构 (Pipeline Architecture)',
      fourStages: '4个自动化构建阶段',
      standards: '运行规范与高可靠性',
      howItWorks: '开发时的自动运作机制',
      howItWorks1: '每当您将代码推送至 GitHub 主分支，云端 Runner 立即自动启动构建与优化任务。',
      howItWorks2: '全流程在隔离的云端环境中执行，完全不占用本地系统资源。',
      howItWorks3: '无需复杂运维配置，始终自动同步至带有 SSL/HTTPS 加密保护的 GitHub Pages。',
      connectedRepo: '已连接至代码仓库 shinikenvin/my-website',
      close: '关闭',
      visitWebsite: '访问网站',
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS.vi;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_portfolio_lang') as Language;
      if (saved && (saved === 'vi' || saved === 'en' || saved === 'ja' || saved === 'ko' || saved === 'zh')) {
        return saved;
      }
    }
    return 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_portfolio_lang', lang);
    }
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
