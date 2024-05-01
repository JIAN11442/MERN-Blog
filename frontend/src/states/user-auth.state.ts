import { create } from 'zustand';
import { GenerateAuthDataType } from '../../../backend/src/utils/types.util';

interface AuthProps {
  authUser: GenerateAuthDataType | null;
  setAuthUser: (user: GenerateAuthDataType | null) => void;
}

const useAuthStore = create<AuthProps>((set) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
}));

export default useAuthStore;
