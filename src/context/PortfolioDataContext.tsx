import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, BlogPost } from '../types';
import { PROJECTS_DATA, BLOG_POSTS, PERSONAL_INFO } from '../data/portfolioData';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: any;
}

export interface PortfolioInfo {
  name: string;
  role: string;
  email: string;
  location: string;
  status: string;
  avatarUrl: string | null;
  website: string;
  github: string;
}

interface PortfolioDataContextType {
  personalInfo: PortfolioInfo;
  projects: Project[];
  blogPosts: BlogPost[];
  messages: ContactMessage[];
  loading: boolean;
  updatePersonalInfo: (info: Partial<PortfolioInfo>) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  editProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<void>;
  editBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  sendContactMessage: (msg: { name: string; email: string; subject: string; message: string }) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PortfolioInfo>(() => {
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_portfolio_avatar') : null;
    return {
      name: PERSONAL_INFO.name,
      role: PERSONAL_INFO.role,
      email: PERSONAL_INFO.email,
      location: PERSONAL_INFO.location,
      status: PERSONAL_INFO.status,
      avatarUrl: savedAvatar,
      website: PERSONAL_INFO.website,
      github: PERSONAL_INFO.github,
    };
  });

  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Personal Info
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'content', 'personalInfo'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPersonalInfo(prev => ({
          ...prev,
          ...data,
          avatarUrl: data.avatarUrl ?? prev.avatarUrl,
        }));
      }
    }, (error) => {
      console.warn('Firestore personalInfo read:', error.message);
    });
    return () => unsub();
  }, []);

  // Sync Projects
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Project[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Project, 'id'>) });
        });
        setProjects(list);
      } else {
        // If empty, use default data
        setProjects(PROJECTS_DATA);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firestore projects read:', error.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync Blog Posts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'posts'), (snapshot) => {
      if (!snapshot.empty) {
        const list: BlogPost[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) });
        });
        setBlogPosts(list);
      } else {
        setBlogPosts(BLOG_POSTS);
      }
    }, (error) => {
      console.warn('Firestore posts read:', error.message);
    });
    return () => unsub();
  }, []);

  // Sync Messages (Admin only)
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) });
      });
      setMessages(list);
    }, (error) => {
      console.warn('Firestore messages read:', error.message);
    });
    return () => unsub();
  }, [user]);

  // Actions
  const updatePersonalInfo = async (info: Partial<PortfolioInfo>) => {
    const updated = { ...personalInfo, ...info };
    setPersonalInfo(updated);
    if (info.avatarUrl !== undefined) {
      if (info.avatarUrl) {
        localStorage.setItem('user_portfolio_avatar', info.avatarUrl);
      } else {
        localStorage.removeItem('user_portfolio_avatar');
      }
    }
    await setDoc(doc(db, 'content', 'personalInfo'), updated, { merge: true });
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    const ref = await addDoc(collection(db, 'projects'), project);
    setProjects(prev => [{ id: ref.id, ...project }, ...prev]);
  };

  const editProject = async (id: string, project: Partial<Project>) => {
    await updateDoc(doc(db, 'projects', id), project);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p));
  };

  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addBlogPost = async (post: Omit<BlogPost, 'id'>) => {
    const ref = await addDoc(collection(db, 'posts'), post);
    setBlogPosts(prev => [{ id: ref.id, ...post }, ...prev]);
  };

  const editBlogPost = async (id: string, post: Partial<BlogPost>) => {
    await updateDoc(doc(db, 'posts', id), post);
    setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, ...post } : p));
  };

  const deleteBlogPost = async (id: string) => {
    await deleteDoc(doc(db, 'posts', id));
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  const sendContactMessage = async (msg: { name: string; email: string; subject: string; message: string }) => {
    await addDoc(collection(db, 'messages'), {
      ...msg,
      createdAt: serverTimestamp(),
    });
  };

  const deleteMessage = async (id: string) => {
    await deleteDoc(doc(db, 'messages', id));
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <PortfolioDataContext.Provider value={{
      personalInfo,
      projects,
      blogPosts,
      messages,
      loading,
      updatePersonalInfo,
      addProject,
      editProject,
      deleteProject,
      addBlogPost,
      editBlogPost,
      deleteBlogPost,
      sendContactMessage,
      deleteMessage,
    }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}
