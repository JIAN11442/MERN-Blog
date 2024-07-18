import axios from "axios";
import toast from "react-hot-toast";

import useHomeBlogStore from "../states/home-blog.state";
import useAuthorProfileStore from "../states/author-profile.state";
import useSettingStore from "../states/setting.state";
import useProviderStore from "../states/provider.state";
import useDashboardStore from "../states/dashboard.state";

import type {
  AuthorProfileStructureType,
  FetchLoadPropsType,
  FetchUserPropsType,
  FollowAuthorsPropsType,
  GenerateToLoadStructureType,
  NotificationStructureType,
} from "../commons/types.common";

import { FormatDataForLoadMoreOrLess } from "../commons/generate.common";

const useUserFetch = () => {
  const USER_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/user";

  const { queryUsers, setQueryUsers } = useHomeBlogStore();
  const { authorProfileInfo, setAuthorProfileInfo } = useAuthorProfileStore();
  const { account_info } =
    (authorProfileInfo as AuthorProfileStructureType) ?? {};

  const { setIsFollowing } = useSettingStore();
  const { setToastLoading } = useProviderStore();
  const {
    notificationsInfo,
    followersAuthorByLimit,
    followingAuthorByLimit,
    allFollowingAuthor,
    allFollowersAuthor,
    refreshFollowAuthor,
    setFollowingAuthorByLimit,
    setAllFollowingAuthor,
    setRefreshFollowAuthor,
  } = useDashboardStore();

  // Get related blogs author
  const GetRelatedBlogsAuthorByQuery = async ({
    query,
    page = 1,
    state = "initial",
  }: FetchLoadPropsType) => {
    const requestURL = USER_SERVER_ROUTE + "/query-related-users";

    await axios
      .post(requestURL, { query, page })
      .then(async ({ data }) => {
        if (data.queryUsers) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: queryUsers,
            fetchData: data.queryUsers,
            page,
            countRoute: "/query-related-users-count",
            fetchRoute: "user",
            data_to_send: { query },
            state,
          });

          setQueryUsers(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Get author profile information
  const GetAuthorProfileInfo = async (authorUsername: string) => {
    const requestURL = USER_SERVER_ROUTE + "/get-author-profile-info";

    axios
      .post(requestURL, { authorUsername })
      .then(({ data }) => {
        if (data.author) {
          setAuthorProfileInfo(data.author);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Check user is following
  const CheckAuthorIsFollowingByUser = async (authorUsername: string) => {
    const requestUrl = USER_SERVER_ROUTE + "/check-author-is-following-by-user";

    await axios
      .post(requestUrl, { authorUsername })
      .then(({ data }) => {
        if (data) {
          setIsFollowing(data.isFollowing);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Follow author
  const FollowAuthorByUsername = async ({
    authorUsername,
    submitBtn_e,
    notificationIndex,
    followAuthorCardIndex,
    for_page,
  }: FetchUserPropsType) => {
    const requestUrl = USER_SERVER_ROUTE + "/follow-author";
    const target = submitBtn_e?.currentTarget as HTMLButtonElement;

    // 顯示 Loading
    const toastLoading = toast.loading("Following...");
    setToastLoading(true);

    // 禁用追蹤按鈕
    target.disabled = true;

    await axios
      .post(requestUrl, { authorUsername })
      .then(({ data }) => {
        if (data) {
          // 更新 zustand 中用戶的總追蹤數量
          account_info.total_following += 1;
          setIsFollowing(true);

          // 如果有提供 notificationIndex，代表是從通知頁面進行追蹤
          // 那就需要更新 zustand 中的通知數據
          if (
            notificationIndex !== undefined &&
            notificationsInfo &&
            "results" in notificationsInfo &&
            notificationsInfo.results
          ) {
            (
              notificationsInfo.results[
                notificationIndex
              ] as NotificationStructureType
            ).follow = data.userId;
          }

          const followersAuthor = (
            for_page ? followersAuthorByLimit : allFollowersAuthor
          ) as GenerateToLoadStructureType;

          // 如果有提供 followAuthorCardIndex，代表是從追蹤作者卡片進行追蹤
          // 那就需要更新 zustand 中的追蹤作者數據
          if (followAuthorCardIndex !== undefined && followersAuthor.results) {
            (
              followersAuthor.results[
                followAuthorCardIndex
              ] as FollowAuthorsPropsType
            ).isFollowing = true;
          }

          setRefreshFollowAuthor(!refreshFollowAuthor);

          toast.dismiss(toastLoading);
          toast.success(data.message);

          target.disabled = false;
        }
      })
      .catch((error) => {
        console.log(error);

        toast.dismiss(toastLoading);
        toast.error("Failed to follow this author.");

        target.disabled = false;
      });
  };

  // Unfollow author
  const UnfollowAuthorByUsername = async ({
    authorUsername,
    submitBtn_e,
    followAuthorCardIndex,
    for_page,
  }: FetchUserPropsType) => {
    const requestUrl = USER_SERVER_ROUTE + "/unfollow-author";
    const target = submitBtn_e?.currentTarget as HTMLButtonElement;

    // 顯示 Loading
    const toastLoading = toast.loading("Unfollowing...");
    setToastLoading(true);

    // 禁用追蹤按鈕
    target.disabled = true;

    await axios
      .post(requestUrl, { authorUsername })
      .then(({ data }) => {
        if (data) {
          // 如果有提供 for_page，那就是有要分頁，所以要更新的是 followingAuthorByLimit
          // 反之，就是沒有分頁(取全部)，所以要更新的是 allFollowingAuthor
          const followingAuthor = (
            for_page ? followingAuthorByLimit : allFollowingAuthor
          ) as GenerateToLoadStructureType;

          const setFollowingAuthor = for_page
            ? setFollowingAuthorByLimit
            : setAllFollowingAuthor;

          // 更新 zustand 中用戶的總追蹤數量
          account_info.total_following -= 1;

          // 更新 zustand 中的追蹤作者數據
          if (followAuthorCardIndex !== undefined && followingAuthor.results) {
            followingAuthor.results.splice(followAuthorCardIndex, 1);
            followingAuthor.totalDocs -= 1;

            setFollowingAuthor(followingAuthor);
          }

          setRefreshFollowAuthor(!refreshFollowAuthor);

          // 停止 loading 並顯示成功訊息
          toast.dismiss(toastLoading);
          setIsFollowing(false);
          toast.success(data.message);

          // 恢復追蹤按鈕
          target.disabled = false;
        }
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss(toastLoading);
        setIsFollowing(false);
        target.disabled = false;
      });
  };

  return {
    GetRelatedBlogsAuthorByQuery,
    GetAuthorProfileInfo,
    CheckAuthorIsFollowingByUser,
    FollowAuthorByUsername,
    UnfollowAuthorByUsername,
  };
};

export default useUserFetch;
