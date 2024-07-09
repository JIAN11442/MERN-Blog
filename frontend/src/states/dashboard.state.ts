import { create } from "zustand";
import {
  BlogStructureType,
  GenerateToLoadStructureType,
  NotificationFilterPropsType,
  NotificationStructureType,
} from "../commons/types.common";

interface DashboardProps {
  notificationsInfo:
    | NotificationStructureType[]
    | GenerateToLoadStructureType
    | null;

  filter: NotificationFilterPropsType;
  query: string;
  isDeleteReply: boolean;
  isMarked: boolean;
  publishedBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  draftBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;

  activeRemoveNtfWarningModal: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  };
  activeDeleteNtfWarningModal: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  };
  activeDeletePblogWarningModal: {
    state: boolean;
    index?: number;
    data: BlogStructureType | null;
    deleteBtnRef: React.RefObject<HTMLButtonElement> | null;
  };
  activeDeleteDfblogWarningModal: {
    state: boolean;
    index?: number;
    data: BlogStructureType | null;
    deleteBtnRef: React.RefObject<HTMLButtonElement> | null;
  };
  refreshBlogs: boolean;

  setNotificationsInfo: (
    info: NotificationStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setFilter: (filter: NotificationFilterPropsType) => void;
  setQuery: (query: string) => void;
  setIsDeleteReply: (isDelete: boolean) => void;
  setIsMarked: (isMarkRead: boolean) => void;
  setPublishedBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setDraftBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;

  setActiveRemoveNtfWarningModal: (active: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  }) => void;
  setActiveDeleteNtfWarningModal: (active: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  }) => void;
  setActiveDeletePblogWarningModal: (status: {
    state: boolean;
    index?: number;
    data: BlogStructureType | null;
    deleteBtnRef: React.RefObject<HTMLButtonElement> | null;
  }) => void;
  setActiveDeleteDfblogWarningModal: (status: {
    state: boolean;
    index?: number;
    data: BlogStructureType | null;
    deleteBtnRef: React.RefObject<HTMLButtonElement> | null;
  }) => void;
  setRefreshBlogs: (status: boolean) => void;
}

const useDashboardStore = create<DashboardProps>((set) => ({
  notificationsInfo: null,
  notificationByFilterObj: {
    page: 1,
    filter: "all",
    deleteDocCount: 0,
  },
  filter: {
    type: "all",
    count: 0,
  },
  query: "",
  isDeleteReply: false,
  isMarked: false,
  publishedBlogs: null,
  draftBlogs: null,

  activeRemoveNtfWarningModal: { state: false, index: 0, data: null },
  activeDeleteNtfWarningModal: { state: false, index: 0, data: null },
  activeDeletePblogWarningModal: {
    state: false,
    index: 0,
    data: null,
    deleteBtnRef: null,
  },
  activeDeleteDfblogWarningModal: {
    state: false,
    index: 0,
    data: null,
    deleteBtnRef: null,
  },
  refreshBlogs: false,

  setNotificationsInfo: (info) => set({ notificationsInfo: info }),
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  setIsDeleteReply: (isDelete) => set({ isDeleteReply: isDelete }),
  setIsMarked: (isMarkRead) => set({ isMarked: isMarkRead }),
  setPublishedBlogs: (blogs) => set({ publishedBlogs: blogs }),
  setDraftBlogs: (blogs) => set({ draftBlogs: blogs }),

  setActiveRemoveNtfWarningModal: (active) =>
    set({ activeRemoveNtfWarningModal: active }),
  setActiveDeleteNtfWarningModal: (active) => {
    set({ activeDeleteNtfWarningModal: active });
  },
  setActiveDeletePblogWarningModal: (isDelete) =>
    set({ activeDeletePblogWarningModal: isDelete }),
  setActiveDeleteDfblogWarningModal: (isDelete) =>
    set({ activeDeleteDfblogWarningModal: isDelete }),
  setRefreshBlogs: (status) => set({ refreshBlogs: status }),
}));

export default useDashboardStore;
