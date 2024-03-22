import { create } from 'zustand';
import type { BlogStructureType } from '../../../backend/src/types';

interface BlogProps {
  editorState: string;
  blog: BlogStructureType;

  setEditorState: (state: string) => void;
  setBlog: (blog: BlogStructureType) => void;
}

const useBlogStore = create<BlogProps>((set) => ({
  editorState: 'editor',
  blog: {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} },
  },

  setEditorState: (state) => set({ editorState: state }),
  setBlog: (blog) => set({ blog }),
}));

export default useBlogStore;
