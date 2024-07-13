import { create } from "zustand";
import { ScrollPropsType } from "../commons/types.common";

interface ProviderProps {
  toastLoading: boolean;
  scrollbarVisible: ScrollPropsType;
  isOnline: boolean;
  theme: string | null;

  setToastLoading: (state: boolean) => void;
  setScrollbarVisible: (state: ScrollPropsType) => void;
  initialProviderState: () => void;
  setIsOnline: (state: boolean) => void;
  setTheme: (state: string | null) => void;
}

const useProviderStore = create<ProviderProps>((set) => ({
  toastLoading: false,
  scrollbarVisible: { visible: false, position: 0 },
  isOnline: false,
  theme: null,

  setToastLoading: (state) => set({ toastLoading: state }),
  setScrollbarVisible: (state) => set({ scrollbarVisible: state }),
  initialProviderState: () =>
    set({
      scrollbarVisible: { visible: false, position: 0 },
    }),
  setIsOnline: (state) => set({ isOnline: state }),
  setTheme: (state) => set({ theme: state }),
}));

export default useProviderStore;
