import { create } from "zustand";
import type { AuthorProfileStructureType } from "../commons/types.common";

interface AuthorProfileProps {
  authorProfileInfo: AuthorProfileStructureType | null;
  followState: { active: boolean; state: string };

  setAuthorProfileInfo: (profile: AuthorProfileStructureType | null) => void;
  initialAuthorProfileInfo: () => void;
  setFollowState: (state: { active: boolean; state: string }) => void;
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
    total_followers: 0,
    total_following: 0,
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
  followState: { active: false, state: "Following" },

  setAuthorProfileInfo: (profile) => set({ authorProfileInfo: profile }),
  initialAuthorProfileInfo: () =>
    set({ authorProfileInfo: initialAuthorProfileInfo }),
  setFollowState: (state) => set({ followState: state }),
}));

export default useAuthorProfileStore;
