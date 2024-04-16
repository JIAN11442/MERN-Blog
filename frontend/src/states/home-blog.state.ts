import { create } from 'zustand';
import type {
  BlogStructureType,
  GenerateBlogStructureType,
} from '../../../backend/src/utils/types.util';

interface homeBlogProps {
  inPageNavIndex: number;
  inPageNavState: string;
  latestBlogs: BlogStructureType[] | GenerateBlogStructureType | null;
  trendingBlogs: BlogStructureType[] | null;
  categories: string[];

  setInPageNavIndex: (index: number) => void;
  setInPageNavState: (state: string) => void;
  setLatestBlogs: (
    blogs: BlogStructureType[] | GenerateBlogStructureType | null
  ) => void;
  setTrendingBlogs: (blogs: BlogStructureType[]) => void;
  setCategories: (tags: string[]) => void;
}

const useHomeBlogStore = create<homeBlogProps>((set) => ({
  inPageNavIndex: 0,
  inPageNavState: 'home',
  latestBlogs: null,
  trendingBlogs: null,
  categories: [],

  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
  setInPageNavState: (state) => set({ inPageNavState: state }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
  setTrendingBlogs: (blogs) => set({ trendingBlogs: blogs }),
  setCategories: (tags) => set({ categories: tags }),
}));

export default useHomeBlogStore;
