import { create } from 'zustand';
import type {
  BlogStructureType,
  GenerateBlogStructureType,
} from '../../../backend/src/utils/types.util';

interface homeBlogProps {
  inPageNavIndex: number;
  inPageNavState: string;
  latestBlogs: BlogStructureType[] | GenerateBlogStructureType | null;
  trendingBlogs: BlogStructureType[] | GenerateBlogStructureType | null;
  queryBlogs: BlogStructureType[] | GenerateBlogStructureType | null;
  allCategories: string[] | null;
  scrollbarVisible: boolean;
  loadBlogsLimit: number;

  setInPageNavIndex: (index: number) => void;
  setInPageNavState: (state: string) => void;
  setLatestBlogs: (
    blogs: BlogStructureType[] | GenerateBlogStructureType | null
  ) => void;
  setTrendingBlogs: (
    blogs: BlogStructureType[] | GenerateBlogStructureType | null
  ) => void;
  setQueryBlogs: (
    blogs: BlogStructureType[] | GenerateBlogStructureType | null
  ) => void;
  setAllCategories: (tags: string[] | null) => void;
  setScrollbarVisible: (visible: boolean) => void;
}

const useHomeBlogStore = create<homeBlogProps>((set) => ({
  inPageNavIndex: 0,
  inPageNavState: 'home',
  latestBlogs: null,
  trendingBlogs: null,
  queryBlogs: null,
  allCategories: [],
  scrollbarVisible: false,
  loadBlogsLimit: import.meta.env.VITE_BLOGS_LIMIT,

  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
  setInPageNavState: (state) => set({ inPageNavState: state }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
  setTrendingBlogs: (blogs) => set({ trendingBlogs: blogs }),
  setQueryBlogs: (blogs) => set({ queryBlogs: blogs }),
  setAllCategories: (tags) => set({ allCategories: tags }),
  setScrollbarVisible: (visible) => set({ scrollbarVisible: visible }),
}));

export default useHomeBlogStore;
