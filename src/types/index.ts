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
  category: 'web' | 'mobile' | 'ai-cloud' | 'devtools';
  categoryLabel: string;
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  year: string;
  featured?: boolean;
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
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  skills: string[];
}

export interface SkillGroup {
  title: string;
  description: string;
  skills: {
    name: string;
    level: number; // 0-100
    experience: string;
    highlight?: boolean;
  }[];
}
