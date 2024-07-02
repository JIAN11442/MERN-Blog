import { create } from "zustand";
import {
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

  setNotificationsInfo: (info) => set({ notificationsInfo: info }),
  setActiveRemoveWarningModal: (active) =>
    set({ activeRemoveWarningModal: active }),
  setActiveDeleteWarningModal: (active) => {
    set({ activeDeleteWarningModal: active });
  },
  setFilter: (filter) => set({ filter }),
  setIsDeleteReply: (isDelete) => set({ isDeleteReply: isDelete }),
  setIsMarked: (isMarkRead) => set({ isMarked: isMarkRead }),
}));

export default useDashboardStore;
