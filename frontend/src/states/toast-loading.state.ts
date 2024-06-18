import { create } from "zustand";

interface ToastLoadingProps {
  toastLoading: boolean;
  setToastLoading: (state: boolean) => void;
}

const useToastLoadingStore = create<ToastLoadingProps>((set) => ({
  toastLoading: false,
  setToastLoading: (state) => set({ toastLoading: state }),
}));

export default useToastLoadingStore;
