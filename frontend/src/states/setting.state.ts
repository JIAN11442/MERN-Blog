import { create } from "zustand";

interface SettingProps {
  isProfileUpdated: boolean;
  setIsProfileUpdated: (state: boolean) => void;
}

const useSettingStore = create<SettingProps>((set) => ({
  isProfileUpdated: false,
  setIsProfileUpdated: (state) => set({ isProfileUpdated: state }),
}));

export default useSettingStore;
