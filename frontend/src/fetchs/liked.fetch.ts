import axios from "axios";

import useAuthStore from "../states/user-auth.state";
import useBlogLikedStore from "../states/blog-liked.state";
import useHomeBlogStore from "../states/home-blog.state";
import useTargetBlogStore from "../states/target-blog.state";
import type { BlogStructureType } from "../commons/types.common";

interface FetchLikedPropsType {
  blogObjectId: string;
  isLikedByUser?: boolean | null;
}

const useLikedFetch = () => {
  const { authUser } = useAuthStore();
  const { setIsLikedByUser } = useBlogLikedStore();
  const { setLatestBlogs, latestBlogs } = useHomeBlogStore();
  const { targetBlogInfo } = useTargetBlogStore();

  // 因爲以下的請求都需要驗證用戶是否登入，所以在這裡設置全局的請求頭
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${authUser?.access_token}`;

  const LIKED_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/liked";

  // 检查用户是否曾經按贊了博客
  const GetLikeStatusOfBlog = async ({ blogObjectId }: FetchLikedPropsType) => {
    const requestURL = LIKED_SERVER_ROUTE + "/get-user-like-status";

    await axios
      .post(requestURL, { blogObjectId })
      .then(({ data: { result } }) => {
        setIsLikedByUser(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 更新目標博客的点赞状态
  const UpdateLikeStatusOfBlog = async ({
    blogObjectId,
    isLikedByUser,
  }: FetchLikedPropsType) => {
    const requestURL = LIKED_SERVER_ROUTE + "/like-blog";

    await axios
      .post(requestURL, { blogObjectId, isLikedByUser })
      .then(({ data }) => {
        if (data) {
          if (latestBlogs && "results" in latestBlogs) {
            // 為了在不重新向後端請求取得 latestBlogs 的情況下，即時改變目標 blog 的點贊數
            // 這裡直接在本地更新 zustand 管理的 latestBlogs 數據
            const updateTargetBlogTotalLikes = latestBlogs?.results?.map(
              (blog: BlogStructureType) => {
                if (blog.blog_id === targetBlogInfo.blog_id) {
                  return {
                    ...blog,
                    activity: {
                      ...blog.activity,
                      total_likes:
                        (blog.activity?.total_likes ?? 0) +
                        (isLikedByUser ? 1 : -1),
                    },
                  };
                } else {
                  return blog;
                }
              }
            );

            setLatestBlogs({
              ...latestBlogs,
              results: updateTargetBlogTotalLikes as BlogStructureType[],
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return { UpdateLikeStatusOfBlog, GetLikeStatusOfBlog };
};

export default useLikedFetch;
