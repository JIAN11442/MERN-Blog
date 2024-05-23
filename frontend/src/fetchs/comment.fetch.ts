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
  const { results: commentsArr } = comments ?? {};
  const { total_comments, total_parent_comments } = activity ?? {};

  const { totalParentCommentsLoaded, setTotalParentCommentsLoaded } =
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
    commentsArr = null,
  }: FetchCommentPropsType) => {
    let res;

    return GetCommentsByBlogId({ blogObjectId, skip }).then((comments) => {
      // 賦予所有取得的未回復留言一個 childrenLevel 屬性，並將其設為 0
      comments.map((comment: GenerateCommentStructureType) => {
        comment.childrenLevel = 0;
      });

      setTotalParentCommentsLoaded(totalParentCommentsLoaded + comments.length);

      if (commentsArr === null) {
        res = { results: comments };
      } else {
        res = { results: [...commentsArr, ...comments] };
      }

      return res;
    });
  };

  // 創建新的頭留言
  const AddCommentToBlog = async ({
    blogObjectId,
    comment,
    blog_author,
    replying_to,
    index,
    replyState,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/create-new-comment';

    await axios
      .post(requestURL, { blogObjectId, comment, blog_author, replying_to })
      .then(({ data }) => {
        if (data) {
          let newCommentsArr = [];

          // 讀取目標 blog 時重構的 comments 資料
          const commentsArr =
            comments && 'results' in comments ? comments.results : [];

          // 將創建的新留言資料也重構成符合一開始讀取 comments 時重構的樣子
          // 比如賦予 commented_by 屬性，並將其設為當前登入用戶的相關資訊
          data.commented_by = {
            personal_info: { username, fullname, profile_img },
          };

          data.blog_id = blogObjectId;

          // 如果是回覆留言
          if (replying_to && index !== undefined) {
            // 如果被並回覆留言下的子留言剛好也有子留言並且展開了
            // 那就要找到被回覆留言離下一同層級留言的距離是多少
            let childrenLayer = 0;

            if (
              commentsArr[index + 1] &&
              commentsArr[index + 1].childrenLevel >
                commentsArr[index].childrenLevel
            ) {
              while (
                commentsArr[index + 1 + childrenLayer].childrenLevel !==
                commentsArr[index].childrenLevel
              ) {
                childrenLayer += 1;
                if (!commentsArr[index + 1 + childrenLayer]) break;
              }
            }

            // 然後將新留言插入到該留言下子留言的最後一個留言後面
            const startingPoint = index + (childrenLayer ?? 0) + 1;

            commentsArr[index].children?.push(data._id);

            data.childrenLevel = commentsArr[index].childrenLevel + 1;
            data.parentIndex = index;

            commentsArr[index].isReplyLoaded = true;

            commentsArr.splice(startingPoint, 0, data);

            newCommentsArr = commentsArr;

            replyState?.setIsReplying(false);
          }
          // 如果是頭留言
          else {
            // 賦予 childrenLevel 屬性，並將其設為 0
            data.childrenLevel = 0;

            // 將創建的新留言資料加入到目標 blog 的 comments 資料中
            newCommentsArr = commentsArr ? [...commentsArr, data] : [data];
          }

          // 要累加的創建頭留言數
          const parentCommentIncrementVal = replying_to ? 0 : 1;

          // 更新目標 blog 的 comments 資料和 activity 資料
          // 記得 (total_comments ?? 0) + 1 一定要括弧，不然就沒意義了
          // 因為 ?? 這個運算符的優先級比 + 低
          // 所以如果寫成 total_comments ?? 0 + 1，就會先執行 ?? 這個運算符，再執行 + 1
          // 結果會變成 total_comments ?? 1
          // 這樣的話當 total_comments 不為 undefined 或 null，比如是 0, 1, 2, 3....時，
          // 結果會返回原本的 total_comments，這樣就沒意義了
          setTargetBlogInfo({
            ...targetBlogInfo,
            comments: { ...comments, results: newCommentsArr },
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
            (totalParentCommentsLoaded ?? 0) + parentCommentIncrementVal
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

  // 載入目標留言的回覆留言
  const LoadRepliesCommentById = async ({
    repliedCommentId,
    skip = 0,
    index,
    commentsArr = null,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/load-replies-comment';

    await axios
      .post(requestURL, { repliedCommentId, skip })
      .then(({ data: { repliesComment } }) => {
        if (repliesComment && commentsArr && index !== undefined) {
          repliesComment.map(
            (comment: GenerateCommentStructureType) =>
              (comment.childrenLevel = commentsArr[index].childrenLevel + 1)
          );

          commentsArr.splice(index + 1, 0, ...repliesComment);

          setTargetBlogInfo({
            ...targetBlogInfo,
            comments: { results: commentsArr },
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 刪除目標留言
  const deleteCommentFunc = async ({
    index,
    commentsArr,
    totalDeletedCommentNum,
  }: FetchCommentPropsType) => {
    if (commentsArr && index !== undefined) {
      // 目標刪除留言的 parentIndex
      const parentIndex = commentsArr.findIndex(
        (comment) => comment._id === commentsArr[index].parent
      );

      // 如果該留言并未展開其回覆留言
      if (!commentsArr[index].isReplyLoaded) {
        // 直接刪除當前留言
        commentsArr.splice(index, 1);
        // 並回溯到該留言的母留言，刪除其 children 中的最後一個留言
        // 如果刪除的目標本就是頭留言，那得到的 parentIndex 就是 -1，commentArr[-1] 會是 undefined，所以不會執行
        // 反之，如果是回覆留言，那就會刪除其母留言的 children 中的最後一個留言

        if (commentsArr[parentIndex]) {
          commentsArr[parentIndex].children?.pop();
        }
      } else {
        // 如果展開了其回覆留言
        // 那就要刪除其下所有的回覆留言
        while (
          commentsArr[index + 1].childrenLevel >
          commentsArr[index].childrenLevel
        ) {
          commentsArr.splice(index + 1, 1);

          if (!commentsArr[index + 1]) {
            break;
          }
        }

        // 刪除完所有回覆留言後，再刪除該留言
        commentsArr.splice(index, 1);
      }

      // 當母留言的 children 數量為 0 時，將其 isReplyLoaded 設為 false
      if (commentsArr[parentIndex]?.children?.length === 0) {
        commentsArr[parentIndex].isReplyLoaded = false;
      }
    }

    setTargetBlogInfo({
      ...targetBlogInfo,
      comments: { ...comments, results: commentsArr ?? [] },
      activity: {
        ...activity,
        total_comments: (total_comments ?? 0) - (totalDeletedCommentNum ?? 0),
      },
    });
  };

  const DeleteTargetComment = async ({
    commentObjectId,
    index = 0,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + '/delete-target-comment';

    await axios
      .post(requestURL, { commentObjectId })
      .then(({ data }) => {
        if (data) {
          // 因為沒辦法直接從前端知道刪除的總留言數
          // 比如刪除的留言其下可能有很多層的子留言，沒全部展開的話，就不知道有多少個
          // 因此只能在後端返回刪除的留言數，然後再在前端進行計算
          deleteCommentFunc({
            index,
            commentsArr,
            totalDeletedCommentNum: data.deletedCommentNum,
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
    LoadRepliesCommentById,
    DeleteTargetComment,
  };
};

export default useCommentFetch;
