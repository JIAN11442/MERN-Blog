import { create } from 'zustand';
import type { GenerateCommentStructureType } from '../commons/types.common';

interface BlogCommentProps {
  commentsWrapper: boolean;
  totalParentCommentsLoaded: number;
  comment: string;
  isCommented: boolean;
  deletedComment: {
    state: boolean;
    comment: GenerateCommentStructureType | null;
  };
  modalRefStore: React.RefObject<HTMLDivElement>;

  setCommentsWrapper: (state: boolean) => void;
  setTotalParentCommentsLoaded: (state: number) => void;
  setComment: (text: string) => void;
  setIsCommented: (state: boolean) => void;
  setDeletedComment: (status: {
    state: boolean;
    comment: GenerateCommentStructureType | null;
  }) => void;
  setModalRefStore: (ref: React.RefObject<HTMLDivElement>) => void;
  initialCommentState: () => void;
}

const useBlogCommentStore = create<BlogCommentProps>((set) => ({
  commentsWrapper: false,
  totalParentCommentsLoaded: 0,
  isCommented: false,
  comment: '',
  deletedComment: { state: false, comment: null },
  modalRefStore: { current: null },

  setCommentsWrapper: (state) => set({ commentsWrapper: state }),
  setTotalParentCommentsLoaded: (state) =>
    set({ totalParentCommentsLoaded: state }),
  setComment: (text) => set({ comment: text }),
  setIsCommented: (state) => set({ isCommented: state }),
  setDeletedComment: (status) => set({ deletedComment: status }),
  setModalRefStore: (ref) => set({ modalRefStore: ref }),
  initialCommentState: () => set({ commentsWrapper: false }),
}));

export default useBlogCommentStore;
