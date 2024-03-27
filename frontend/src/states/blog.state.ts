import { create } from 'zustand';
import EditorJS from '@editorjs/editorjs';

import type { BlogStructureType } from '../../../backend/src/types';

interface BlogProps {
  editorState: string;
  blog: BlogStructureType;
  textEditor: EditorJS | null;
  characterLimit: number;
  tagsLimit: number;
  isTagEdit: { state: boolean; index: number | null };

  setTextEditor: (editor: EditorJS | null) => void;
  setEditorState: (state: string) => void;
  setBlog: (blog: BlogStructureType) => void;
  setIsTagEdit: (status: { state: boolean; index: number | null }) => void;
}

const useBlogStore = create<BlogProps>((set) => ({
  editorState: 'editor',
  blog: {
    title: '',
    banner: '',
    content: { blocks: [] },
    tags: [],
    des: '',
    author: { personal_info: {} },
  },
  textEditor: null,
  characterLimit: 300,
  tagsLimit: 10,
  isTagEdit: { state: false, index: null },

  setEditorState: (state) => set({ editorState: state }),
  setBlog: (blog) => set({ blog }),
  setTextEditor: (editor) => set({ textEditor: editor }),
  setIsTagEdit: (status) => set({ isTagEdit: status }),
}));

export default useBlogStore;
