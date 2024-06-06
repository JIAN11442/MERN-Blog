import { create } from "zustand";
import type {
  AdjustContainerWidthPropsType,
  GenerateCommentStructureType,
  RepliesLoadedPropsType,
} from "../commons/types.common";

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
  modalStoreRef: React.RefObject<HTMLDivElement>;
  totalRepliesLoaded: RepliesLoadedPropsType[];
  maxChildrenLevel: number;
  adjustContainerWidth: AdjustContainerWidthPropsType;
  editComment: { status: boolean; data: GenerateCommentStructureType | null };
  isEditedComment: boolean;
  isEditWarning: boolean;
  deleteBtnDisabled: boolean;

  setCommentsWrapper: (state: boolean) => void;
  setTotalParentCommentsLoaded: (state: number | null) => void;
  setComment: (text: string) => void;
  setIsCommented: (state: boolean) => void;
  setDeletedComment: (status: {
    state: boolean;
    index: number;
    comment: GenerateCommentStructureType | null;
  }) => void;
  setModalStoreRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setTotalRepliesLoaded: (state: RepliesLoadedPropsType[]) => void;
  setMaxChildrenLevel: (level: number) => void;
  setAdjustContainerWidth: (state: AdjustContainerWidthPropsType) => void;
  setEditComment: (state: {
    status: boolean;
    data: GenerateCommentStructureType | null;
  }) => void;
  setIsEditedComment: (state: boolean) => void;
  setIsEditWarning: (state: boolean) => void;
  setDeleteBtnDisabled: (state: boolean) => void;

  initialCommentState: () => void;
}

const useBlogCommentStore = create<BlogCommentProps>((set) => ({
  commentsWrapper: false,
  totalParentCommentsLoaded: 0,
  isCommented: false,
  comment: "",
  deletedComment: { state: false, index: 0, comment: null },
  modalStoreRef: { current: null },
  totalRepliesLoaded: [],
  maxChildrenLevel: 0,
  adjustContainerWidth: {
    maxChildrenLevel: 0,
    commentCardWidth: 0,
    incrementVal: 0,
    adjustWidth: false,
  },
  editComment: { status: false, data: null },
  isEditedComment: false,
  isEditWarning: false,
  deleteBtnDisabled: false,

  setCommentsWrapper: (state) => set({ commentsWrapper: state }),
  setTotalParentCommentsLoaded: (state) =>
    set({ totalParentCommentsLoaded: state }),
  setComment: (text) => set({ comment: text }),
  setIsCommented: (state) => set({ isCommented: state }),
  setDeletedComment: (status) => set({ deletedComment: status }),
  setModalStoreRef: (ref) => set({ modalStoreRef: ref }),
  setTotalRepliesLoaded: (state) => set({ totalRepliesLoaded: state }),
  setMaxChildrenLevel: (level) => set({ maxChildrenLevel: level }),
  setAdjustContainerWidth: (state) => set({ adjustContainerWidth: state }),
  setEditComment: (state) => set({ editComment: state }),
  setIsEditedComment: (state) => set({ isEditedComment: state }),
  setIsEditWarning: (state) => set({ isEditWarning: state }),
  setDeleteBtnDisabled: (state) => set({ deleteBtnDisabled: state }),

  initialCommentState: () => set({ commentsWrapper: false }),
}));

export default useBlogCommentStore;
