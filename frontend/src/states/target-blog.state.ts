import { create } from 'zustand';
import type { BlogStructureType } from '../../../backend/src/utils/types.util';
import type { OutputData } from '@editorjs/editorjs';

const initialBlogInfo = {
  author: {
    personal_info: {
      fullname: '',
      username: '',
      profile_img: '',
    },
  },
  activity: {
    total_comments: 0,
    total_likes: 0,
    total_parent_comments: 0,
    total_reads: 0,
  },
  banner: '',
  blog_id: '',
  content: {} as OutputData,
  des: '',
  publishedAt: '',
  tags: [],
  title: '',
};

interface TargetBlogProps {
  targetBlogInfo: BlogStructureType;
  setTargetBlogInfo: (blog: BlogStructureType) => void;
  initialBlogInfo: () => void;
}

const useTargetBlogStore = create<TargetBlogProps>((set) => ({
  targetBlogInfo: initialBlogInfo,
  setTargetBlogInfo: (blog) => set({ targetBlogInfo: blog }),
  initialBlogInfo: () => set({ targetBlogInfo: initialBlogInfo }),
}));

export default useTargetBlogStore;
