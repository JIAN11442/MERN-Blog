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
  activeRemoveWarningModal: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  };
  activeDeleteWarningModal: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  };
  filter: NotificationFilterPropsType;
  isDeleteReply: boolean;
  isMarked: boolean;
  publishedBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  draftBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;

  setNotificationsInfo: (
    info: NotificationStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setActiveRemoveWarningModal: (active: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  }) => void;
  setActiveDeleteWarningModal: (active: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  }) => void;
  setFilter: (filter: NotificationFilterPropsType) => void;
  setIsDeleteReply: (isDelete: boolean) => void;
  setIsMarked: (isMarkRead: boolean) => void;
  setPublishedBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setDraftBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
}

const useDashboardStore = create<DashboardProps>((set) => ({
  notificationsInfo: null,
  activeRemoveWarningModal: { state: false, index: 0, data: null },
  activeDeleteWarningModal: {
    state: false,
    index: 0,
    data: null,
  },
  notificationByFilterObj: {
    page: 1,
    filter: "all",
    deleteDocCount: 0,
  },
  filter: {
    type: "all",
    count: 0,
  },
  isDeleteReply: false,
  isMarked: false,
  publishedBlogs: null,
  draftBlogs: null,

  setNotificationsInfo: (info) => set({ notificationsInfo: info }),
  setActiveRemoveWarningModal: (active) =>
    set({ activeRemoveWarningModal: active }),
  setActiveDeleteWarningModal: (active) => {
    set({ activeDeleteWarningModal: active });
  },
  setFilter: (filter) => set({ filter }),
  setIsDeleteReply: (isDelete) => set({ isDeleteReply: isDelete }),
  setIsMarked: (isMarkRead) => set({ isMarked: isMarkRead }),
  setPublishedBlogs: (blogs) => set({ publishedBlogs: blogs }),
  setDraftBlogs: (blogs) => set({ draftBlogs: blogs }),
}));

export default useDashboardStore;
