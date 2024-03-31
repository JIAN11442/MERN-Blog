import { create } from 'zustand';
import { GenarateDataType } from '../../../backend/src/utils/types.util';

interface AuthProps {
  authUser: GenarateDataType | null;
  setAuthUser: (user: GenarateDataType | null) => void;
}

const useAuthStore = create<AuthProps>((set) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
}));

export default useAuthStore;
