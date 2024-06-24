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
  setNotificationInfo: (
    info: NotificationStructureType[] | GenerateToLoadStructureType | null
  ) => void;
}

const useDashboardStore = create<DashboardProps>((set) => ({
  notificationsInfo: null,
  setNotificationInfo: (info) => set({ notificationsInfo: info }),
}));

export default useDashboardStore;
