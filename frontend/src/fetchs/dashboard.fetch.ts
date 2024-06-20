import axios from "axios";
import useAuthStore from "../states/user-auth.state";
import { GenerateAuthDataType } from "../commons/types.common";

const useDashBoardFetch = () => {
  const DASHBOARD_SERVER_ROUTE =
    import.meta.env.VITE_SERVER_DOMAIN + "/dashboard";

  const { authUser, setAuthUser } = useAuthStore();

  // 取得通知情況
  const GetNotifications = async () => {
    await axios
      .get(DASHBOARD_SERVER_ROUTE + "/get-notifications")
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

  return { GetNotifications };
};

export default useDashBoardFetch;
