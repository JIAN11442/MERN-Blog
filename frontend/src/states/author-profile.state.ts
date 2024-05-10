import { create } from "zustand";
import type { AuthorProfileStructureType } from "../commons/types.common";

interface AuthorProfileProps {
  authorProfileInfo: AuthorProfileStructureType | null;

  setAuthorProfileInfo: (profile: AuthorProfileStructureType | null) => void;
}

const useAuthorProfileStore = create<AuthorProfileProps>((set) => ({
  authorProfileInfo: {
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
  },

  setAuthorProfileInfo: (profile) => set({ authorProfileInfo: profile }),
}));

export default useAuthorProfileStore;
