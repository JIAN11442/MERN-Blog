import { create } from "zustand";
import type { AuthorProfileStructureType } from "../commons/types.common";

interface AuthorProfileProps {
  authorProfileInfo: AuthorProfileStructureType | null;

  setAuthorProfileInfo: (profile: AuthorProfileStructureType | null) => void;
  resetAuthorProfileInfo: () => void;
}

const initialAuthorProfileInfo = {
  _id: "",
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
  },
  createdAt: "",
};

const useAuthorProfileStore = create<AuthorProfileProps>((set) => ({
  authorProfileInfo: initialAuthorProfileInfo,

  setAuthorProfileInfo: (profile) => set({ authorProfileInfo: profile }),
  resetAuthorProfileInfo: () =>
    set({ authorProfileInfo: initialAuthorProfileInfo }),
}));

export default useAuthorProfileStore;
