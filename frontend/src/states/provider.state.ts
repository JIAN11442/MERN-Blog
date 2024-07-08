import { create } from "zustand";
import { ScrollPropsType } from "../commons/types.common";

interface ProviderProps {
  toastLoading: boolean;
  scrollbarVisible: ScrollPropsType;
  isOnline: boolean;

  setToastLoading: (state: boolean) => void;
  setScrollbarVisible: (state: ScrollPropsType) => void;
  initialProviderState: () => void;
  setIsOnline: (state: boolean) => void;
}

const useProviderStore = create<ProviderProps>((set) => ({
  toastLoading: false,
  scrollbarVisible: { visible: false, position: 0 },
  isOnline: false,

  setToastLoading: (state) => set({ toastLoading: state }),
  setScrollbarVisible: (state) => set({ scrollbarVisible: state }),
  initialProviderState: () =>
    set({
      scrollbarVisible: { visible: false, position: 0 },
    }),
  setIsOnline: (state) => set({ isOnline: state }),
}));

export default useProviderStore;
