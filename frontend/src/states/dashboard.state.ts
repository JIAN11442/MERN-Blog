import { create } from "zustand";
import {
  AuthorProfileStructureType,
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
  blogQuery: string;
  isDeleteReply: boolean;
  isMarked: boolean;
  publishedBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  draftBlogs: BlogStructureType[] | GenerateToLoadStructureType | null;
  refreshBlogs: boolean;
  refreshFollowAuthor: boolean;
  authorQuery: string;
  activeNotificationPanel:boolean

  followingAuthorByLimit:
    | AuthorProfileStructureType[]
    | GenerateToLoadStructureType
    | null;
  followersAuthorByLimit:
    | AuthorProfileStructureType[]
    | GenerateToLoadStructureType
    | null;
  allFollowingAuthor:
    | AuthorProfileStructureType[]
    | GenerateToLoadStructureType
    | null;
  allFollowersAuthor:
    | AuthorProfileStructureType[]
    | GenerateToLoadStructureType
    | null;

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

  setNotificationsInfo: (
    info: NotificationStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setFilter: (filter: NotificationFilterPropsType) => void;
  setBlogQuery: (query: string) => void;
  setIsDeleteReply: (isDelete: boolean) => void;
  setIsMarked: (isMarkRead: boolean) => void;
  setPublishedBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setDraftBlogs: (
    blogs: BlogStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setRefreshBlogs: (status: boolean) => void;
  setRefreshFollowAuthor: (status: boolean) => void;
  setAuthorQuery: (query: string) => void;
  setActiveNotificationPanel:(status:boolean) => void;

  setFollowingAuthorByLimit: (
    author: AuthorProfileStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setFollowersAuthorByLimit: (
    author: AuthorProfileStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setAllFollowingAuthor: (
    author: AuthorProfileStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setAllFollowersAuthor: (
    author: AuthorProfileStructureType[] | GenerateToLoadStructureType | null
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
  blogQuery: "",
  isDeleteReply: false,
  isMarked: false,
  publishedBlogs: null,
  draftBlogs: null,
  refreshBlogs: false,
  refreshFollowAuthor: false,
  authorQuery: "",
  activeNotificationPanel:false,
  followingAuthorByLimit: null,
  followersAuthorByLimit: null,
  allFollowingAuthor: null,
  allFollowersAuthor: null,

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

  setNotificationsInfo: (info) => set({ notificationsInfo: info }),
  setFilter: (filter) => set({ filter }),
  setBlogQuery: (query) => set({ blogQuery: query }),
  setIsDeleteReply: (isDelete) => set({ isDeleteReply: isDelete }),
  setIsMarked: (isMarkRead) => set({ isMarked: isMarkRead }),
  setPublishedBlogs: (blogs) => set({ publishedBlogs: blogs }),
  setDraftBlogs: (blogs) => set({ draftBlogs: blogs }),
  setRefreshBlogs: (status) => set({ refreshBlogs: status }),
  setRefreshFollowAuthor: (status) => set({ refreshFollowAuthor: status }),
  setAuthorQuery: (query) => set({ authorQuery: query }),
  setActiveNotificationPanel:(status)=>set({activeNotificationPanel:status}),
  setFollowingAuthorByLimit: (author) =>
    set({ followingAuthorByLimit: author }),
  setFollowersAuthorByLimit: (author) =>
    set({ followersAuthorByLimit: author }),
  setAllFollowingAuthor: (author) => set({ allFollowingAuthor: author }),
  setAllFollowersAuthor: (author) => set({ allFollowersAuthor: author }),

  setActiveRemoveNtfWarningModal: (active) =>
    set({ activeRemoveNtfWarningModal: active }),
  setActiveDeleteNtfWarningModal: (active) => {
    set({ activeDeleteNtfWarningModal: active });
  },
  setActiveDeletePblogWarningModal: (isDelete) =>
    set({ activeDeletePblogWarningModal: isDelete }),
  setActiveDeleteDfblogWarningModal: (isDelete) =>
    set({ activeDeleteDfblogWarningModal: isDelete }),
}));


export default useDashboardStore;