import { create } from 'zustand';
import type {
  GenerateCommentStructureType,
  RepliesLoadedPropsType,
} from '../commons/types.common';

interface BlogCommentProps {
  commentsWrapper: boolean;
  totalParentCommentsLoaded: number | null;
  comment: string;
  isCommented: boolean;
  deletedComment: {
    state: boolean;
    index: number;
    comment: GenerateCommentStructureType | null;
  };
  modalRefStore: React.RefObject<HTMLDivElement>;
  totalRepliesLoaded: RepliesLoadedPropsType[];

  setCommentsWrapper: (state: boolean) => void;
  setTotalParentCommentsLoaded: (state: number | null) => void;
  setComment: (text: string) => void;
  setIsCommented: (state: boolean) => void;
  setDeletedComment: (status: {
    state: boolean;
    index: number;
    comment: GenerateCommentStructureType | null;
  }) => void;
  setModalRefStore: (ref: React.RefObject<HTMLDivElement>) => void;
  setTotalRepliesLoaded: (state: RepliesLoadedPropsType[]) => void;
  initialCommentState: () => void;
}

const useBlogCommentStore = create<BlogCommentProps>((set) => ({
  commentsWrapper: false,
  totalParentCommentsLoaded: 0,
  isCommented: false,
  comment: '',
  deletedComment: { state: false, index: 0, comment: null },
  modalRefStore: { current: null },
  totalRepliesLoaded: [],

  setCommentsWrapper: (state) => set({ commentsWrapper: state }),
  setTotalParentCommentsLoaded: (state) =>
    set({ totalParentCommentsLoaded: state }),
  setComment: (text) => set({ comment: text }),
  setIsCommented: (state) => set({ isCommented: state }),
  setDeletedComment: (status) => set({ deletedComment: status }),
  setModalRefStore: (ref) => set({ modalRefStore: ref }),
  setTotalRepliesLoaded: (state) => set({ totalRepliesLoaded: state }),
  initialCommentState: () => set({ commentsWrapper: false }),
}));

export default useBlogCommentStore;
