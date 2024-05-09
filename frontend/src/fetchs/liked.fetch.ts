import axios from "axios";

import useAuthStore from "../states/user-auth.state";
import useBlogLikedStore from "../states/blog-liked.state";

interface FetchLikedPropsType {
  blogObjectID: string;
  isLikedByUser?: boolean | null;
}

const useLikedFetch = () => {
  const { authUser } = useAuthStore();
  const { setIsLikedByUser } = useBlogLikedStore();

  // 因爲以下的請求都需要驗證用戶是否登入，所以在這裡設置全局的請求頭
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${authUser?.access_token}`;

  const LIKED_SERVER_ROUTE =
    import.meta.env.VITE_SERVER_DOMAIN + "/notification";

  // 检查用户是否曾經按贊了博客
  const GetLikeStatusOfBlog = async ({ blogObjectID }: FetchLikedPropsType) => {
    const requestURL = LIKED_SERVER_ROUTE + "/get-user-like-status";

    await axios
      .post(requestURL, { blogObjectID })
      .then(({ data: { result } }) => {
        setIsLikedByUser(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 更新目標博客的点赞状态
  const UpdateLikeStatusOfBlog = async ({
    blogObjectID,
    isLikedByUser,
  }: FetchLikedPropsType) => {
    const requestURL = LIKED_SERVER_ROUTE + "/like-blog";

    await axios
      .post(requestURL, { blogObjectID, isLikedByUser })
      .then(({ data: { message } }) => {
        console.log(message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return { UpdateLikeStatusOfBlog, GetLikeStatusOfBlog };
};

export default useLikedFetch;
