import { create } from "zustand";

interface SettingProps {
  SettingUpdated: boolean;
  setSettingUpdated: (state: boolean) => void;
}

const useSettingStore = create<SettingProps>((set) => ({
  SettingUpdated: false,
  setSettingUpdated: (state) => set({ SettingUpdated: state }),
}));

export default useSettingStore;
