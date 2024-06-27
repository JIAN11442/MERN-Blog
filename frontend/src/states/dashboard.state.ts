import { create } from "zustand";
import {
  GenerateToLoadStructureType,
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

  setNotificationsInfo: (
    info: NotificationStructureType[] | GenerateToLoadStructureType | null
  ) => void;
  setActiveRemoveWarningModal: (active: {
    state: boolean;
    index: number;
    data: NotificationStructureType | null;
  }) => void;
}

const useDashboardStore = create<DashboardProps>((set) => ({
  notificationsInfo: null,
  activeRemoveWarningModal: { state: false, index: 0, data: null },

  setNotificationsInfo: (info) => set({ notificationsInfo: info }),
  setActiveRemoveWarningModal: (active) =>
    set({ activeRemoveWarningModal: active }),
}));

export default useDashboardStore;
