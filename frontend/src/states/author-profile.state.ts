import { create } from 'zustand';
import type { AuthorProfileStructureType } from '../../../backend/src/utils/types.util';

interface AuthorProfileProps {
  authorProfile: AuthorProfileStructureType | null;
  setAuthorProfile: (profile: AuthorProfileStructureType | null) => void;
}

const useAuthorProfileStore = create<AuthorProfileProps>((set) => ({
  authorProfile: null,
  setAuthorProfile: (profile) => set({ authorProfile: profile }),
}));

export default useAuthorProfileStore;
