import { create } from "zustand";
import type {
  PersonalInfoStructureType,
  BlogStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface HomeBlogProps {
  inPageNavState: string;
  latestBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  trendingBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  queryBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  allCategories: string[] | null;
  queryUsers: PersonalInfoStructureType[] | GenerateToLoadStructureType | null;

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
  queryUsers: null,

  setInPageNavState: (state) => set({ inPageNavState: state }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
  setTrendingBlogs: (blogs) => set({ trendingBlogs: blogs }),
  setQueryBlogs: (blogs) => set({ queryBlogs: blogs }),
  setAllCategories: (tags) => set({ allCategories: tags }),
  setQueryUsers: (users) => set({ queryUsers: users }),
  initialHomeBlogState: () =>
    set({
      inPageNavState: "home",
      latestBlogs: null,
      trendingBlogs: null,
      queryBlogs: null,
      allCategories: [],
      queryUsers: null,
    }),
}));

export default useHomeBlogStore;
