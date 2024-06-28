import axios from "axios";

import useAuthStore from "../states/user-auth.state";
import useDashboardStore from "../states/dashboard.state";

import {
  GenerateAuthDataType,
  FetchDashboardPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";
import { FormatDataForLoadMoreOrLess } from "../commons/generate.common";
import toast from "react-hot-toast";

const useDashboardFetch = () => {
  const DASHBOARD_SERVER_ROUTE =
    import.meta.env.VITE_SERVER_DOMAIN + "/dashboard";

  const { authUser, setAuthUser } = useAuthStore();
  const { notificationsInfo, setNotificationsInfo } = useDashboardStore();

  // 根據用戶 ID 取得通知情況
  const GetNotificationsByUserId = async () => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/get-notifications-userId";

    await axios
      .get(requestUrl)
      .then(({ data }) => {
        // 將通知資料更新至 zustand 的 authUser
        const newAuthUser = {
          ...authUser,
          notification: data.notification,
        } as GenerateAuthDataType;

        setAuthUser(newAuthUser);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 根據 Filter 來取得通知
  const GetNotificationByFilter = async ({
    page = 1,
    filter,
    deleteDocCount = 0,
    state,
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/notifications-filter-info";

    await axios
      .post(requestUrl, { page, filter, deleteDocCount })
      .then(async ({ data }) => {
        const formattedData = await FormatDataForLoadMoreOrLess({
          prevArr: notificationsInfo,
          fetchData: data.notification,
          page,
          fetchRoute: "dashboard",
          countRoute: "/notifications-filter-count",
          data_to_send: { filter },
          state,
        });

        setNotificationsInfo(formattedData as GenerateToLoadStructureType);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 更新通知狀態
  const UpdateNotificationRemoveState = async ({
    notificationId,
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/remove-notification";

    const taostLoading = toast.loading("Removing...");

    await axios
      .post(requestUrl, { notificationId })
      .then(({ data }) => {
        if (data) {
          toast.dismiss(taostLoading);
          toast.success(data.message);
        }
      })
      .catch((error) => {
        toast.dismiss(taostLoading);
        console.log(error);
      });
  };

  return {
    GetNotificationsByUserId,
    GetNotificationByFilter,
    UpdateNotificationRemoveState,
  };
};

export default useDashboardFetch;
