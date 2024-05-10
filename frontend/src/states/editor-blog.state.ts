import { create } from "zustand";
import EditorJS from "@editorjs/editorjs";

import type { BlogStructureType } from "../commons/types.common";

export const initialBlog = {
  title: "",
  banner: "",
  content: { blocks: [] },
  tags: [],
  des: "",
  author: { personal_info: {} },
};

interface EditorBlogProps {
  editorState: string;
  editorBlog: BlogStructureType;
  textEditor: EditorJS | null;
  characterLimit: number;
  tagsLimit: number;
  isTagEdit: { state: boolean; index: number | null };

  setTextEditor: (editor: EditorJS | null) => void;
  setEditorState: (state: string) => void;
  setEditorBlog: (blog: BlogStructureType) => void;
  setIsTagEdit: (status: { state: boolean; index: number | null }) => void;
  initialEditBlog: () => void;
}

const useEditorBlogStore = create<EditorBlogProps>((set) => ({
  editorState: "editor",
  editorBlog: initialBlog,
  textEditor: null,
  characterLimit: 300,
  tagsLimit: 10,
  isTagEdit: { state: false, index: null },

  setEditorState: (state) => set({ editorState: state }),
  setEditorBlog: (blog) => set({ editorBlog: blog }),
  setTextEditor: (editor) => set({ textEditor: editor }),
  setIsTagEdit: (status) => set({ isTagEdit: status }),
  initialEditBlog: () => set({ editorBlog: initialBlog }),
}));

export default useEditorBlogStore;
