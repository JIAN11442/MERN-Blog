import { create } from 'zustand';

interface BlogCommentProps {
  commentsWrapper: boolean;
  totalParentCommentsLoaded: number;
  comment: string;

  setCommentsWrapper: (state: boolean) => void;
  setTotalParentCommentsLoaded: (state: number) => void;
  initialCommentState: () => void;
  setComment: (text: string) => void;
}

const useBlogCommentStore = create<BlogCommentProps>((set) => ({
  commentsWrapper: false,
  totalParentCommentsLoaded: 0,
  comment: '',

  setCommentsWrapper: (state) => set({ commentsWrapper: state }),
  setTotalParentCommentsLoaded: (state) =>
    set({ totalParentCommentsLoaded: state }),
  initialCommentState: () => set({ commentsWrapper: false }),
  setComment: (text: string) => set({ comment: text }),
}));

export default useBlogCommentStore;
