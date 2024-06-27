import axios from "axios";
import toast from "react-hot-toast";

import useAuthStore from "../states/user-auth.state";
import useBlogCommentStore from "../states/blog-comment.state";
import useTargetBlogStore from "../states/target-blog.state";

import {
  GenerateCommentStructureType,
  FetchCommentPropsType,
  NotificationStructureType,
} from "../commons/types.common";
import useDashboardStore from "../states/dashboard.state";

const useCommentFetch = () => {
  const { authUser } = useAuthStore();
  const { username, fullname, profile_img } = authUser ?? {};

  const { setTargetBlogInfo, targetBlogInfo } = useTargetBlogStore();
  const { comments, activity } = targetBlogInfo ?? {};
  const { results: commentsArr } = comments ?? {};
  const { total_comments, total_parent_comments } = activity ?? {};

  const { notificationsInfo } = useDashboardStore();

  const {
    totalParentCommentsLoaded,
    totalRepliesLoaded,
    setTotalParentCommentsLoaded,
    setTotalRepliesLoaded,
  } = useBlogCommentStore();

  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${authUser?.access_token}`;

  const COMMENT_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/comment";
  const LOAD_COMMENT_LIMIT = import.meta.env.VITE_COMMENTS_LIMIT;

  // 取得目標 blog 的所有未回復留言
  const GetCommentsByBlogId = async ({
    blogObjectId,
    skip,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + "/get-blog-comments";

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
    notificationId,
    notificationIndex,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + "/create-new-comment";

    await axios
      .post(requestURL, {
        blogObjectId,
        comment,
        blog_author,
        replying_to,
        notificationId,
      })
      .then(({ data }) => {
        if (data) {
          // 如果是從 notification 那裡回覆並新增的留言，
          // 就會有 notificationId 和 notificationIndex
          if (notificationId && notificationIndex) {
            if (
              notificationsInfo &&
              "results" in notificationsInfo &&
              notificationsInfo.results
            ) {
              // 這時候會需要更新 zustand 處的 notificationInfo 中 results 中的目標通知內容
              // 添加上 reply ，這樣我們才能即時得知已從 notification 處回覆
              (
                notificationsInfo.results[
                  notificationIndex
                ] as NotificationStructureType
              ).reply = { _id: notificationId, comment: data.comment };
            }
          }
          // 反之，不是在 notification 處回覆
          // 那就是在 comment container 那裡
          else {
            let newCommentsArr = [];

            // 讀取目標 blog 時重構的 comments 資料
            const commentsArr =
              comments && "results" in comments ? comments.results : [];

            // 將創建的新留言資料也重構成符合一開始讀取 comments 時重構的樣子
            // 比如賦予 commented_by 屬性，並將其設為當前登入用戶的相關資訊
            data.commented_by = {
              personal_info: { username, fullname, profile_img },
            };

            data.blog_id = blogObjectId;

            // 如果是回覆留言
            if (replying_to && index !== undefined) {
              // 找到與當前留言同層的留言的 index
              // 那就是我們要插入新留言的位置
              let startingPoint = commentsArr.findIndex(
                (comment, i) =>
                  i > index &&
                  (comment.childrenLevel ?? 0) <=
                    (commentsArr[index].childrenLevel ?? 0)
              );

              // 但如果沒有找到，那就代表當前 blog 只有一個留言，也就是現在要回覆的頭留言
              // 那就直接插入到最後一個位置即可
              if (startingPoint === -1) {
                startingPoint = commentsArr.length;
              }

              // 然後將新留言插入到該留言下子留言的最後一個留言後面
              commentsArr[index].children?.push(data._id);

              data.childrenLevel = (commentsArr[index].childrenLevel ?? 0) + 1;
              data.parent = commentsArr[index]._id;
              data.parentIndex = index;

              // 如果原留言的子留言數還沒到限制數量，
              if (
                (commentsArr[index]?.children?.length ?? 0) <=
                LOAD_COMMENT_LIMIT
              ) {
                let newTotalRepliesLoaded = totalRepliesLoaded;

                const isRecordedRepliesLoadedIndex =
                  totalRepliesLoaded.findIndex((item) => item.index === index);

                // 就要看是否已經有記錄過該留言的載入回覆留言數
                // 如果沒有記錄過，那就新增一個記錄
                if (
                  isRecordedRepliesLoadedIndex === -1 ||
                  totalRepliesLoaded[isRecordedRepliesLoadedIndex].loadedNum ===
                    0
                ) {
                  newTotalRepliesLoaded = [
                    ...totalRepliesLoaded,
                    {
                      index,
                      loadedNum: commentsArr[index].children?.length ?? 0,
                    },
                  ];
                }
                // 如果有記錄過，那就累加載入的回覆留言數
                else {
                  newTotalRepliesLoaded = totalRepliesLoaded.map((item) =>
                    item.index === index
                      ? { ...item, loadedNum: item.loadedNum + 1 }
                      : item
                  );
                }

                // 接著更新 totalRepliesLoaded
                setTotalRepliesLoaded(newTotalRepliesLoaded);

                // 最後，將新留言插入到母留言的最後一個子留言後面
                commentsArr.splice(startingPoint, 0, data);
              }

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
        }
      })
      .catch((error) => {
        if (error.response) {
          // 伺服器端返回了錯誤狀態碼
          toast.error(error.response.data.errorMessage);
        } else if (error.request) {
          // 請求發出但沒有收到回應
          console.log(error.request);
          toast.error("Request made but no response received");
        } else {
          // 在設定請求時出現錯誤
          console.log(error.message);
          toast.error("Request setup error: ", error.message);
        }
      });
  };

  // 載入目標留言的回覆留言
  const LoadRepliesCommentById = async ({
    loadmore = false,
    repliedCommentId,
    skip = 0,
    index,
    commentsArr = null,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + "/load-replies-comment";

    await axios
      .post(requestURL, { repliedCommentId, skip })
      .then(({ data: { repliesComment } }) => {
        if (repliesComment && commentsArr && index !== undefined) {
          // 先找到當前要載入回覆留言的母留言的 index
          // 是否已經在 totalRepliesLoaded 中有記錄

          const indexInTotalRepliesLoaded = totalRepliesLoaded.findIndex(
            (item) => item.index === index
          );

          // 如果有記錄過，那就累加載入的回覆留言數
          if (indexInTotalRepliesLoaded !== -1) {
            setTotalRepliesLoaded(
              totalRepliesLoaded.map((item) =>
                item.index === index
                  ? {
                      ...item,
                      loadedNum: item.loadedNum + repliesComment.length,
                    }
                  : item
              )
            );
          }
          // 否則就新增一個記錄
          else {
            setTotalRepliesLoaded([
              ...totalRepliesLoaded,
              { index: index, loadedNum: repliesComment.length },
            ]);
          }

          repliesComment.map((comment: GenerateCommentStructureType) => {
            comment.childrenLevel = (commentsArr[index].childrenLevel ?? 0) + 1;
            // 為了方便之後前端判斷是否加入[載入更多留言 button 功能]而設定的屬性
            comment.parentIndex = index;
          });

          // 如果不是 loadmore 模式，那就是正常展開回覆留言模式
          // 那就將載入的回覆留言插入到當前留言(母留言)的下一個位置
          if (!loadmore) {
            commentsArr.splice(index + 1, 0, ...repliesComment);
          } else {
            // 如果當前是 loadmore replies 模式,
            // 那我們要找到當前母留言的最後一個子留言的 index + 1 的位置(要考慮到有可能有多層子留言的情況)
            // 這裡可以有兩種做法，一個是用 for 迴圈；一個是用 findIndex，時間複雜度都是 O(n)

            // 這是用 findIndex 的做法
            let startingPoint = commentsArr.findIndex(
              (comment, i) =>
                i > index &&
                (comment.childrenLevel ?? 0) <=
                  (commentsArr[index].childrenLevel ?? 0)
            );

            if (startingPoint === -1) {
              startingPoint = commentsArr.length;
            }

            // 這是用 for 迴圈的做法
            // let startingPoint = index + 1;

            // for (let i = index + 1; i < commentsArr.length; i++) {
            //   if (
            //     commentsArr[i].childrenLevel > commentsArr[index].childrenLevel
            //   ) {
            //     console.log(i, commentsArr[i].comment);
            //     startingPoint = i;
            //   } else {
            //     startingPoint = startingPoint + 1;
            //     break;
            //   }
            // }

            commentsArr.splice(startingPoint, 0, ...repliesComment);
          }

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
      const parentIndex = commentsArr[index].parentIndex ?? -1;

      // 如果刪除的是回覆留言，
      if (parentIndex >= 0) {
        // 先一步刪除其母留言的 children 中的對應刪除目標留言 ID
        // 這樣一來留言數也會一併減少
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children?.filter((child) => child !== commentsArr[index]._id);

        // 再將母留言對應的 totalRepliesLoaded 中的 loadedNum 減 1
        setTotalRepliesLoaded(
          totalRepliesLoaded.map((item) =>
            item.index === parentIndex
              ? { ...item, loadedNum: item.loadedNum - 1 }
              : item
          )
        );
      }

      // 如果有展開，那就要刪除其下所有回覆留言
      if (commentsArr[index] && commentsArr[index].isReplyLoaded) {
        while (
          (commentsArr[index + 1].childrenLevel ?? 0) >
          (commentsArr[index].childrenLevel ?? 0)
        ) {
          commentsArr.splice(index + 1, 1);

          if (!commentsArr[index + 1]) {
            break;
          }
        }

        // 再刪除自己本身
        commentsArr.splice(index, 1);
      }
      // 如果沒展開，那不管是頭留言還是回覆留言，都直接刪除自己
      else {
        commentsArr.splice(index, 1);
      }

      // 如果有記錄過該留言的載入回覆留言數，那就要刪除
      // 避免刪除後，如果剛好同個 index 留言被展開，loadedNum 就會累加而不是創建新的
      if (totalRepliesLoaded[index]) {
        setTotalRepliesLoaded(
          totalRepliesLoaded.filter((item) => item.index !== index)
        );
      }

      // 最後，當母留言的 children 數量為 0 時，將其 isReplyLoaded 設為 false
      if (commentsArr[parentIndex]?.children?.length === 0) {
        commentsArr[parentIndex].isReplyLoaded = false;
      }

      setTargetBlogInfo({
        ...targetBlogInfo,
        comments: { ...comments, results: commentsArr },
        activity: {
          ...activity,
          total_comments: (total_comments ?? 0) - (totalDeletedCommentNum ?? 0),
          total_parent_comments:
            parentIndex === -1
              ? (total_parent_comments ?? 0) - 1
              : total_parent_comments,
        },
      });
    }
  };

  const DeleteTargetComment = async ({
    commentObjectId,
    index = 0,
  }: FetchCommentPropsType) => {
    const requestURL = COMMENT_SERVER_ROUTE + "/delete-target-comment";

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

  // 更新目標留言
  const UpdateTargetCommentContent = async ({
    commentObjectId,
    newCommentContent,
  }: FetchCommentPropsType) => {
    if (!newCommentContent?.length) {
      return toast.error("Comment content cannot be empty");
    }

    const requestURL = COMMENT_SERVER_ROUTE + "/update-comment";

    await axios
      .post(requestURL, { commentObjectId, newCommentContent })
      .then(({ data }) => {
        if (data) {
          // 根據前端傳遞的 commentObjectId 找到對應的留言在 commentsArr 中的 index
          const index = commentsArr?.findIndex(
            (comment) => comment._id === commentObjectId
          );

          if (commentsArr && index !== undefined && index >= 0) {
            // 根據 index 找到對應的留言，並更新其 comment 屬性
            commentsArr[index].comment = newCommentContent;

            // 最後更新 zustand 中的 comments 資料
            setTargetBlogInfo({
              ...targetBlogInfo,
              comments: { ...comments, results: commentsArr },
            });
          }
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
    UpdateTargetCommentContent,
  };
};

export default useCommentFetch;
