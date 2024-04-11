import { create } from 'zustand';
import type { BlogStructureType } from '../../../backend/src/utils/types.util';

interface homeBlogProps {
  inPageNavIndex: number;
  latestBlogs: BlogStructureType[] | null;

  setInPageNavIndex: (index: number) => void;
  setLatestBlogs: (blogs: BlogStructureType[]) => void;
}

const useHomeBlogStore = create<homeBlogProps>((set) => ({
  inPageNavIndex: 0,
  latestBlogs: null,

  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
  setLatestBlogs: (blogs) => set({ latestBlogs: blogs }),
}));

export default useHomeBlogStore;
