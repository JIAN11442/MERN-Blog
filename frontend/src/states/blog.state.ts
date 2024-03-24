import { create } from 'zustand';
import EditorJS from '@editorjs/editorjs';

import type { BlogStructureType } from '../../../backend/src/types';

interface BlogProps {
  editorState: string;
  blog: BlogStructureType;
  textEditor: EditorJS | null;

  setTextEditor: (editor: EditorJS | null) => void;
  setEditorState: (state: string) => void;
  setBlog: (blog: BlogStructureType) => void;
}

const useBlogStore = create<BlogProps>((set) => ({
  editorState: 'editor',
  blog: {
    title: '',
    banner: '',
    content: {},
    tags: [],
    des: '',
    author: { personal_info: {} },
  },
  textEditor: null,

  setEditorState: (state) => set({ editorState: state }),
  setBlog: (blog) => set({ blog }),
  setTextEditor: (editor) => set({ textEditor: editor }),
}));

export default useBlogStore;
