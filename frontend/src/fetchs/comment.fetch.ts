import axios from 'axios';
import toast from 'react-hot-toast';

import useAuthStore from '../states/user-auth.state';
import useBlogCommentStore from '../states/blog-comment.state';
import useTargetBlogStore from '../states/target-blog.state';

import {
  GenerateCommentStructureType,
  FetchCommentPropsType,
} from '../commons/types.common';

const useCommentFetch = () => {
  const { authUser } = useAuthStore();
  const { username, fullname, profile_img } = authUser ?? {};

  const { setTargetBlogInfo, targetBlogInfo } = useTargetBlogStore();
  const { comments, activity } = targetBlogInfo ?? {};
  const { total_comments, total_parent_comments } = activity ?? {};

  const { setTotalParentCommentsLoaded, totalParentCommentsLoaded } =
    useBlogCommentStore();

  axios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${authUser?.access_token}`;

  const COMMENT_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + '/comment';

  // 取得目標 blog 的所有未回復留言
  const GetCommentsByBlogId = async ({
    blogObjectId,
    skip,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/get-blog-comments';

    return await axios
      .post(requestURL, { blogObjectId, skip })
      .then(({ data: { comments } }) => {
        return comments;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 調整取得的留言資料結構
  const GetAndGenerateCommentsData = async ({
    skip = 0,
    blogObjectId,
    commentArray = null,
  }: FetchCommentPropsType) => {
    let res;

    return GetCommentsByBlogId({ blogObjectId, skip }).then((comments) => {
      // 賦予所有取得的未回復留言一個 childrenLevel 屬性，並將其設為 0
      comments.map((comment: GenerateCommentStructureType) => {
        comment.childrenLevel = 0;
      });

      setTotalParentCommentsLoaded(totalParentCommentsLoaded + comments.length);

      if (commentArray === null) {
        res = { results: comments };
      } else {
        res = { results: [...commentArray, ...comments] };
      }

      return res;
    });
  };

  // 創建新的頭留言
  const AddCommentToBlog = async ({
    blogObjectId,
    comment,
    blog_author,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/create-new-comment';

    await axios
      .post(requestURL, { blogObjectId, comment, blog_author })
      .then(({ data }) => {
        if (data) {
          // 將創建的新留言資料也重構成符合一開始讀取 comments 時重構的樣子
          // 比如賦予 childrenLevel 屬性，並將其設為 0
          data.childrenLevel = 0;

          // 再比如賦予 commented_by 屬性，並將其設為當前登入用戶的相關資訊
          data.commented_by = {
            personal_info: { username, fullname, profile_img },
          };

          data.blog_id = blogObjectId;

          // 將創建的新留言資料加入到目標 blog 的 comments 資料中
          const newCommentArr =
            comments && 'results' in comments
              ? [...comments.results, data]
              : [data];

          // 要累加的創建頭留言數
          const parentCommentIncrementVal = 1;

          // 更新目標 blog 的 comments 資料和 activity 資料
          // 記得 (total_comments ?? 0) + 1 一定要括弧，不然就沒意義了
          // 因為 ?? 這個運算符的優先級比 + 低
          // 所以如果寫成 total_comments ?? 0 + 1，就會先執行 ?? 這個運算符，再執行 + 1
          // 結果會變成 total_comments ?? 1
          // 這樣的話當 total_comments 不為 undefined 或 null，比如是 0, 1, 2, 3....時，
          // 結果會返回原本的 total_comments，這樣就沒意義了
          setTargetBlogInfo({
            ...targetBlogInfo,
            comments: { ...comments, results: newCommentArr },
            activity: {
              ...activity,
              total_comments: (total_comments ?? 0) + 1,
              total_parent_comments:
                (total_parent_comments ?? 0) + parentCommentIncrementVal,
            },
          });

          // 將一開始讀取目標 blog 資料並賦予重構讀取的 comments 資料時記錄的 '總頭留言數'
          // 加上創建後的那一個頭留言數 parentCommentIncrementVal，就是新的 '總頭留言數'
          setTotalParentCommentsLoaded(
            totalParentCommentsLoaded + parentCommentIncrementVal
          );
        }
      })
      .catch((error) => {
        if (error.response) {
          // 伺服器端返回了錯誤狀態碼
          toast.error(error.response.data.errorMessage);
        } else if (error.request) {
          // 請求發出但沒有收到回應
          console.log(error.request);
          toast.error('Request made but no response received');
        } else {
          // 在設定請求時出現錯誤
          console.log(error.message);
          toast.error('Request setup error: ', error.message);
        }
      });
  };

  // 刪除目標留言
  const DeleteTargetComment = async ({
    commentObjectId,
    blogObjectId,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/delete-target-comment';

    await axios
      .post(requestURL, { commentObjectId, blogObjectId })
      .then(({ data }) => {
        if (data) {
          // 更新本地 zustand 管理的目標 blog 的 comments 資料和 activity 資料
          setTargetBlogInfo({
            ...targetBlogInfo,
            comments: {
              ...comments,
              results:
                comments?.results.filter(
                  (comment: GenerateCommentStructureType) =>
                    comment._id !== commentObjectId
                ) ?? [],
            },
            activity: {
              ...activity,
              total_comments: (activity?.total_comments ?? 0) - 1,
              total_parent_comments: (activity?.total_parent_comments ?? 0) - 1,
            },
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return {
    GetCommentsByBlogId,
    GetAndGenerateCommentsData,
    AddCommentToBlog,
    DeleteTargetComment,
  };
};

export default useCommentFetch;
