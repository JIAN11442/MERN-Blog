import { create } from 'zustand';
import { UserSchemaType } from '../../../backend/src/schemas/user.schema';

interface AuthProps {
  authUser: UserSchemaType | null;
  setAuthUser: (user: UserSchemaType | null) => void;
}

const useAuthStore = create<AuthProps>((set) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
}));

export default useAuthStore;
