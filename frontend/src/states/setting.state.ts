import { create } from "zustand";

interface SettingProps {
  isProfileUpdated: boolean;
  isFollowing: boolean;

  setIsProfileUpdated: (state: boolean) => void;
  setIsFollowing: (state: boolean) => void;
}

const useSettingStore = create<SettingProps>((set) => ({
  isProfileUpdated: false,
  isFollowing: false,

  setIsProfileUpdated: (state) => set({ isProfileUpdated: state }),
  setIsFollowing: (state) => set({ isFollowing: state }),
}));

export default useSettingStore;
