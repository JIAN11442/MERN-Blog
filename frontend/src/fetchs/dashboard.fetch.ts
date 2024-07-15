import axios from "axios";
import toast from "react-hot-toast";

import useAuthStore from "../states/user-auth.state";
import useDashboardStore from "../states/dashboard.state";
import useProviderStore from "../states/provider.state";

import {
  GenerateAuthDataType,
  FetchDashboardPropsType,
  GenerateToLoadStructureType,
  NotificationStructureType,
} from "../commons/types.common";
import { FormatDataForLoadMoreOrLess } from "../commons/generate.common";

const useDashboardFetch = () => {
  const DASHBOARD_SERVER_ROUTE =
    import.meta.env.VITE_SERVER_DOMAIN + "/dashboard";

  const { authUser, setAuthUser } = useAuthStore();
  const { notification } = (authUser as GenerateAuthDataType) ?? {};
  const { countByType, totalCount } = notification ?? {};

  const { setToastLoading } = useProviderStore();

  const {
    notificationsInfo,
    publishedBlogs,
    draftBlogs,
    activeDeletePblogWarningModal,
    activeDeleteDfblogWarningModal,
    refreshBlogs,
    followingAuthor,
    followersAuthor,
    setNotificationsInfo,
    setPublishedBlogs,
    setDraftBlogs,
    setActiveDeletePblogWarningModal,
    setActiveDeleteDfblogWarningModal,
    setRefreshBlogs,
    setFollowingAuthor,
    setFollowersAuthor,
  } = useDashboardStore();

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
    state = "initial",
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

        if (filter !== "all" && formattedData?.results) {
          // 根據目前加載的資料數，更新通知狀態為已讀
          for (const i of formattedData.results) {
            const item = i as NotificationStructureType;
            const loadNum = data.notification.length;
            const filterIndex = countByType.findIndex((t) => t.type === filter);

            if (item.seen == false) {
              UpdateNotificationSeenStateById({
                notificationId: (i as NotificationStructureType)._id,
                seen: true,
              });

              // 接著更新 zustand 中 authUser 的 notification 資料
              if (notification.countByType[filterIndex].count > 0) {
                notification.totalCount = totalCount - loadNum;
                notification.countByType = countByType.map((t) => {
                  if (t.type === filter) {
                    return {
                      ...t,
                      count: t.count - loadNum,
                    };
                  } else {
                    return t;
                  }
                });
              }
            }
          }
        }
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

    setToastLoading(true);

    await axios
      .post(requestUrl, { notificationId })
      .then(({ data }) => {
        if (data) {
          toast.dismiss(taostLoading);
          toast.success(data.message);

          setToastLoading(false);
        }
      })
      .catch((error) => {
        toast.dismiss(taostLoading);
        setToastLoading(false);
        console.log(error);
      });
  };

  // 將用戶所有通知標記為...
  const UpdateNotificationSeenStateByUser = async ({
    seen,
  }: FetchDashboardPropsType) => {
    const requestUrl =
      DASHBOARD_SERVER_ROUTE + "/update-notifications-seen-user";

    await axios.post(requestUrl, { seen }).catch((error) => {
      console.log(error);
    });
  };

  // 根據通知 ID 更新通知狀態
  const UpdateNotificationSeenStateById = async ({
    notificationId,
    seen,
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/update-notifications-seen-id";

    await axios.post(requestUrl, { notificationId, seen }).catch((error) => {
      console.log(error);
    });
  };

  // 取得用戶撰寫的所有 blogs
  const GetUserWrittenBlogsById = async ({
    page = 1,
    draft,
    query = "",
    deleteDocCount = 0,
    state = "initial",
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/get-user-written-blogs-info";

    await axios
      .post(requestUrl, { page, draft, query, deleteDocCount })
      .then(async ({ data }) => {
        if (data) {
          const formattedData = (await FormatDataForLoadMoreOrLess({
            prevArr: draft ? draftBlogs : publishedBlogs,
            fetchData: data.blogs,
            page,
            countRoute: "/get-user-written-blogs-count",
            fetchRoute: "dashboard",
            data_to_send: { draft, query },
            state,
          })) as GenerateToLoadStructureType;

          if (draft) {
            setDraftBlogs(formattedData);
          } else {
            setPublishedBlogs(formattedData);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 刪除目標 blog
  const DeleteTargetBlogById = async ({
    blogObjId,
    deleteBtnRef,
    state,
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/delete-target-blog-id";

    // 顯示刪除中
    const taostLoading = toast.loading("Deleting...");

    setToastLoading(true);

    // 禁用刪除按鈕
    if (deleteBtnRef?.current) {
      deleteBtnRef.current.disabled = true;
    }

    // 開始刪除
    await axios
      .post(requestUrl, { blogObjId })
      .then(({ data }) => {
        if (data) {
          // 恢復刪除按鈕
          if (deleteBtnRef?.current) {
            deleteBtnRef.current.disabled = false;
          }

          // 關閉 loading 並顯示成功訊息
          toast.dismiss(taostLoading);
          toast.success(data.message);

          // 關閉刪除警告視窗
          if (state === "published") {
            setActiveDeletePblogWarningModal({
              ...activeDeletePblogWarningModal,
              state: false,
              index: 0,
              data: null,
              deleteBtnRef: null,
            });
          } else {
            setActiveDeleteDfblogWarningModal({
              ...activeDeleteDfblogWarningModal,
              state: false,
              index: 0,
              data: null,
              deleteBtnRef: null,
            });
          }

          setPublishedBlogs(null);
          setDraftBlogs(null);

          // 強制重新加載
          setRefreshBlogs(!refreshBlogs);
        }
      })
      .catch((error) => {
        console.log(error);

        if (deleteBtnRef?.current) {
          deleteBtnRef.current.disabled = false;
        }

        toast.dismiss(taostLoading);
        toast.error("Failed to delete this blog.");
      });
  };

  // 取得追蹤作者
  const GetFollowAuthors = async ({
    page = 1,
    authorUsername = "",
    query = "",
    fetchFor = "following",
    state = "initial",
  }: FetchDashboardPropsType) => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/get-follow-authors-info";

    await axios
      .post(requestUrl, { page, authorUsername, query, fetchFor })
      .then(async ({ data }) => {
        if (data) {
          const formattedData = (await FormatDataForLoadMoreOrLess({
            prevArr:
              fetchFor === "following" ? followingAuthor : followersAuthor,
            fetchData: data.result,
            page,
            fetchRoute: "dashboard",
            countRoute: "/get-follow-authors-count",
            data_to_send: { authorUsername, query, fetchFor },
            state,
          })) as GenerateToLoadStructureType;

          if (fetchFor === "following") {
            setFollowingAuthor(formattedData);
          } else {
            setFollowersAuthor(formattedData);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 清除所有用戶的追蹤名單
  const ClearAllFollowAuthors = async () => {
    const requestUrl = DASHBOARD_SERVER_ROUTE + "/clear-all-follow-authors";

    const loadingToast = toast.loading("Clearing...");
    setToastLoading(true);

    await axios
      .post(requestUrl)
      .then(({ data }) => {
        if (data) {
          toast.dismiss(loadingToast);
          setToastLoading(false);

          setFollowingAuthor([]);
          setFollowersAuthor([]);

          toast.success(data.message);
        }
      })
      .catch((error) => {
        toast.dismiss(loadingToast);
        setToastLoading(false);

        console.log(error);
      });
  };

  return {
    GetNotificationsByUserId,
    GetNotificationByFilter,
    UpdateNotificationRemoveState,
    UpdateNotificationSeenStateByUser,
    UpdateNotificationSeenStateById,
    GetUserWrittenBlogsById,
    DeleteTargetBlogById,
    GetFollowAuthors,
    ClearAllFollowAuthors,
  };
};

export default useDashboardFetch;
