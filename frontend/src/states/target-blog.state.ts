import { create } from "zustand";
import type { OutputData } from "@editorjs/editorjs";

import type { BlogStructureType } from "../commons/types.common";

const initialBlogInfo = {
  _id: "",
  author: {
    personal_info: {
      fullname: "",
      username: "",
      profile_img: "",
    },
  },
  activity: {
    total_comments: 0,
    total_likes: 0,
    total_parent_comments: 0,
    total_reads: 0,
  },
  banner: "",
  blog_id: "",
  content: {} as OutputData,
  des: "",
  publishedAt: "",
  tags: [],
  title: "",
  comments: { results: [] },
};

interface TargetBlogProps {
  targetBlogInfo: BlogStructureType;
  similarBlogsInfo: BlogStructureType[];

  setTargetBlogInfo: (blog: BlogStructureType) => void;
  setSimilarBlogsInfo: (blogs: BlogStructureType[]) => void;
  initialBlogInfo: () => void;
}

const useTargetBlogStore = create<TargetBlogProps>((set) => ({
  targetBlogInfo: initialBlogInfo,
  similarBlogsInfo: [],

  setTargetBlogInfo: (blog) => set({ targetBlogInfo: blog }),
  setSimilarBlogsInfo: (blogs) => set({ similarBlogsInfo: blogs }),
  initialBlogInfo: () =>
    set({ targetBlogInfo: initialBlogInfo, similarBlogsInfo: [] }),
}));

export default useTargetBlogStore;
