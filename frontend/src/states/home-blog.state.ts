import { create } from 'zustand';
import type {
  PersonalInfoStructureType,
  BlogStructureType,
  GenerateStructureType,
  ScrollPropsType,
} from '../../../backend/src/utils/types.util';

interface HomeBlogProps {
  inPageNavIndex: number;
  inPageNavState: string;
  latestBlogs: BlogStructureType[] | GenerateStructureType | null;
  trendingBlogs: BlogStructureType[] | GenerateStructureType | null;
  queryBlogs: BlogStructureType[] | GenerateStructureType | null;
  allCategories: string[] | null;
  scrollbarVisible: ScrollPropsType;
  loadBlogsLimit: number;
  queryUsers: PersonalInfoStructureType[] | GenerateStructureType | null;
  loadUsersLimit: number;

  setInPageNavIndex: (index: number) => void;
  setInPageNavState: (state: string) => void;
  setLatestBlogs: (
    blogs: BlogStructureType[] | GenerateStructureType | null
  ) => void;
  setTrendingBlogs: (
    blogs: BlogStructureType[] | GenerateStructureType | null
  ) => void;
  setQueryBlogs: (
    blogs: BlogStructureType[] | GenerateStructureType | null
  ) => void;
  setAllCategories: (tags: string[] | null) => void;
  setScrollbarVisible: (state: ScrollPropsType) => void;
  setQueryUsers: (
    users: PersonalInfoStructureType[] | GenerateStructureType | null
  ) => void;
}

const useHomeBlogStore = create<HomeBlogProps>((set) => ({
  inPageNavIndex: 0,
  inPageNavState: 'home',
  latestBlogs: null,
  trendingBlogs: null,
  queryBlogs: null,
  allCategories: [],
  scrollbarVisible: { visible: false, position: 0 },
  loadBlogsLimit: import.meta.env.VITE_BLOGS_LIMIT,
  queryUsers: null,
  loadUsersLimit: import.meta.env.VITE_USERS_LIMIT,

  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
  setInPageNavState: (state) => set({ inPageNavState: state }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
  setTrendingBlogs: (blogs) => set({ trendingBlogs: blogs }),
  setQueryBlogs: (blogs) => set({ queryBlogs: blogs }),
  setAllCategories: (tags) => set({ allCategories: tags }),
  setScrollbarVisible: (state) => set({ scrollbarVisible: state }),
  setQueryUsers: (users) => set({ queryUsers: users }),
}));

export default useHomeBlogStore;
