export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullCaseStudy: {
    overview: string;
    challenge: string;
    solution: string;
    architecture: string[];
    keyFeatures: string[];
    metrics: { label: string; value: string }[];
  };
  category: string;
  categoryLabel: string;
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  year: string;
  featured?: boolean;
  coverImage?: string;
  videoUrl?: string;
  videoTitle?: string;
  galleryImages?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  content: {
    introduction: string;
    sections: {
      heading: string;
      body: string;
      image?: string;
      imageCaption?: string;
      codeSnippet?: {
        language: string;
        code: string;
        filename?: string;
      };
      bulletPoints?: string[];
    }[];
    conclusion: string;
  };
  likes: number;
  coverImage?: string;
  videoUrl?: string;
  videoTitle?: string;
  galleryImages?: string[];
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  skills: string[];
  order?: number;
}

export interface SkillItem {
  id?: string;
  name: string;
  level: number; // 0-100
  experience: string;
  highlight?: boolean;
}

export interface SkillGroup {
  id?: string;
  title: string;
  description: string;
  skills: SkillItem[];
}
