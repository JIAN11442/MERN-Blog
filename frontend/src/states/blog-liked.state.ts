import { create } from "zustand";

interface BlogLikedProps {
  isLikedByUser: boolean | null;
  setIsLikedByUser: (isLiked: boolean) => void;
}

const useBlogLikedStore = create<BlogLikedProps>((set) => ({
  isLikedByUser: false,
  setIsLikedByUser: (isLiked) => set({ isLikedByUser: isLiked }),
}));

export default useBlogLikedStore;
