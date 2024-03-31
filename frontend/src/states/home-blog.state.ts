import { create } from "zustand";

interface homeBlogProps {
  inPageNavIndex: number;
  setInPageNavIndex: (index: number) => void;
}

const useHomeBlogStore = create<homeBlogProps>((set) => ({
  inPageNavIndex: 0,
  setInPageNavIndex: (index) => set({ inPageNavIndex: index }),
}));

export default useHomeBlogStore;
