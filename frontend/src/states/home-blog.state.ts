import { create } from "zustand";
import type {
  PersonalInfoStructureType,
  BlogStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface HomeBlogProps {
  inPageNavIndex: number;
  inPageNavState: string;
  latestBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  trendingBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  queryBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  allCategories: string[] | null;
  loadBlogsLimit: number;
  queryUsers: PersonalInfoStructureType[] | GenerateToLoadStructureType | null;
  loadUsersLimit: number;

  setInPageNavIndex: (index: number) => void;
  setInPageNavState: (state: string) => void;
  setLatestBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setTrendingBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setQueryBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setAllCategories: (tags: string[] | null) => void;
  setQueryUsers: (
    users: PersonalInfoStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  initialHomeBlogState: () => void;
}

const useHomeBlogStore = create<HomeBlogProps>((set) => ({
  inPageNavIndex: 0,
  inPageNavState: "home",
  latestBlogs: null,
  trendingBlogs: null,
  queryBlogs: null,
  allCategories: [],
  loadBlogsLimit: import.meta.env.VITE_BLOGS_LIMIT,
  queryUsers: null,
  loadUsersLimit: import.meta.env.VITE_USERS_LIMIT,

  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
  setInPageNavState: (state) => set({ inPageNavState: state }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
  setTrendingBlogs: (blogs) => set({ trendingBlogs: blogs }),
  setQueryBlogs: (blogs) => set({ queryBlogs: blogs }),
  setAllCategories: (tags) => set({ allCategories: tags }),
  setQueryUsers: (users) => set({ queryUsers: users }),
  initialHomeBlogState: () =>
    set({
      inPageNavIndex: 0,
      inPageNavState: "home",
      latestBlogs: null,
      trendingBlogs: null,
      queryBlogs: null,
      allCategories: [],
      queryUsers: null,
    }),
}));

export default useHomeBlogStore;
