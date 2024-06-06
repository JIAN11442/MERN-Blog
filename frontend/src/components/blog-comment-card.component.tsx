import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import BlogCommentField from "./blog-comment-field.component";
import AnimationWrapper from "./page-animation.component";

import useAuthStore from "../states/user-auth.state";
import useBlogCommentStore from "../states/blog-comment.state";
import useTargetBlogStore from "../states/target-blog.state";

import useCommentFetch from "../fetchs/comment.fetch";

import { FlatIcons } from "../icons/flaticons";

import { getDay } from "../commons/date.common";
import type {
  AuthorProfileStructureType,
  BlogStructureType,
  GenerateCommentStructureType,
} from "../commons/types.common";
import CommentCardOptionsPanel from "./comment-card-panel.component";

interface BlogCommentCardProps {
  index: number;
  commentData: GenerateCommentStructureType;
  leftVal: number;
  paddingLeftIncrementVal?: number;
  options?: boolean;
  optionsCollapse?: boolean;
  allowLoadMoreReplies?: boolean;
}

const BlogCommentCard: React.FC<BlogCommentCardProps> = ({
  index,
  commentData,
  leftVal,
  paddingLeftIncrementVal = 1,
  options = true,
  optionsCollapse = false,
  allowLoadMoreReplies = true,
}) => {
  const {
    _id: commentObjectId,
    comment,
    commented_by,
    commentedAt,
  } = commentData;
  const {
    personal_info: { username, fullname, profile_img },
  } = commented_by as AuthorProfileStructureType;

  const commentCardRef = useRef<HTMLDivElement>(null);
  const commentOptionsRef = useRef<HTMLDivElement>(null);

  const [isReplying, setIsReplying] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);

  const { authUser } = useAuthStore();
  const { access_token, username: authUsername } = authUser ?? {};

  const { targetBlogInfo, setTargetBlogInfo } = useTargetBlogStore();
  const {
    comments: { results: commentsArr },
    author: {
      personal_info: { username: blogAuthorUsername },
    },
  } = targetBlogInfo as Required<BlogStructureType>;

  const {
    totalRepliesLoaded,
    maxChildrenLevel,
    adjustContainerWidth,
    deleteBtnDisabled,
    setDeletedComment,
    setTotalRepliesLoaded,
    setAdjustContainerWidth,
    setDeleteBtnDisabled,
    setEditComment,
  } = useBlogCommentStore();

  // 因為 totalRepliesLoaded 是一個陣列，且是隨著每次加載回覆留言而增加
  // 因此每一個 comment card 如果想要知道自己的母留言加載時記錄在 totalRepliesLoaded 的資訊位置(index)，
  // 就必須透過各自的 parentIndex 來找到，這一步就是透過 findIndex 來找到
  const indexOfRepliesLoadedInCurrCommentData = totalRepliesLoaded.findIndex(
    (item) => item.index === commentData.parentIndex
  );

  const { LoadRepliesCommentById } = useCommentFetch();

  // 顯示刪除留言警告
  const handleDeleteWarning = () => {
    if (!access_token) {
      return toast.error("You need to login to delete a comment");
    }
    // 設定要刪除的留言資訊
    setDeletedComment({ state: true, comment: commentData, index });

    // 並將刪除按鈕設為 disabled
    setDeleteBtnDisabled(true);
  };

  // 回覆留言(出現留言框)
  const handleReply = () => {
    if (!access_token) {
      return toast.error("Please login first before reply");
    }

    setIsReplying(!isReplying);
  };

  // 隱藏回覆留言
  const handleHideReplies = (index: number) => {
    // 先將隱藏回覆留言功能設為 false
    commentData.isReplyLoaded = false;

    // 因為我們是點擊 parent comment 的 Hide Replies 按鈕
    // 所以要取得其下的 children index 的話，自然就是 parent comment 的 index 加上 1
    // 也就是下一個 index
    const childrenIndex = index + 1;

    if (commentsArr[childrenIndex]) {
      // 如果 children comment 的 childrenLevel 大於 parent comment 的 childrenLevel
      // 自然就要刪除該 children comment
      // 就這樣一直迴圈刪除，直到碰到下一個 comment 的 childrenLevel 等於本次 parent comment 的 childrenLevel，也就是 0 才停止迴圈
      // 因為那就代表所有該 parent comment 的 children comment 都已刪除
      // 完成了 Hide Replies 的功能
      // 當然還有一種情況是，blog 只有一個 parent comment, 但其下有多個 children comment
      // 當刪除完所有 comment 後，並不會有下一個 comment 來與本次 parent comment 的 childrenLevel 做比較
      // 所以在每一次迴圈都需要判斷是否有下一個 comment，也就是這裡的 commentsArr[childrenIndex]，如果沒有就不用再迴圈了
      while (
        commentsArr[childrenIndex] &&
        commentsArr[childrenIndex].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(childrenIndex, 1);
      }
    }

    setTargetBlogInfo({
      ...targetBlogInfo,
      comments: { results: commentsArr },
    });

    // 如果當前打算隱藏的母留言下有子留言，
    // 那也需要將其在 totalRepliesLoaded 記錄的加載數量歸零
    // 當然自身也要歸零，所以這裡採用 >= 來處理，而不是 ===
    setTotalRepliesLoaded(
      totalRepliesLoaded.map((item) =>
        item.index >= index ? { ...item, loadedNum: 0 } : item
      )
    );
  };

  // 加載回覆留言(有限制)
  const handleLoadReplies = () => {
    if (commentData.children?.length === 0) {
      return;
    }

    if (!allowLoadMoreReplies) {
      return toast.error(
        "Please increase the browser width to load more replies"
      );
    }

    commentData.isReplyLoaded = true;

    LoadRepliesCommentById({
      repliedCommentId: commentObjectId,
      skip: 0,
      index: index,
      commentsArr,
    });
  };

  // 加載更多回覆留言
  const handleLoadMoreReplies = () => {
    LoadRepliesCommentById({
      loadmore: true,
      repliedCommentId: commentsArr[commentData.parentIndex ?? 0]._id,
      skip: totalRepliesLoaded[indexOfRepliesLoadedInCurrCommentData].loadedNum,
      index: commentData.parentIndex ?? 0,
      commentsArr,
    });
  };

  // 判斷哪個 comment card 下載可以出現 Load more replies 按鈕
  const isLoadMoreReplies = () => {
    // 只有當 comment card 有母留言時(也就是當前是回覆留言)，
    // 且也已經從 fetch 處將加載留言數記錄在 totalRepliesLoaded 時，才需執行
    if (
      (commentData.parent || commentData.parentIndex) &&
      totalRepliesLoaded.length
    ) {
      // 如果該 comment card 的母留言的 children 數量大於 totalRepliesLoaded 記錄的加載數量
      // 且該 comment card 的 id 等於母留言加載的最後一個留言 id，那就代表該 comment card 的確是母留言的最後一個子留言
      // 就需要出現 Load more replies 按鈕，返回 true
      if (
        (commentsArr[commentData.parentIndex ?? 0].children?.length ?? 0) >
          totalRepliesLoaded[indexOfRepliesLoadedInCurrCommentData].loadedNum &&
        commentsArr[commentData.parentIndex ?? 0].children?.[
          totalRepliesLoaded[indexOfRepliesLoadedInCurrCommentData].loadedNum -
            1
        ] === commentData._id
      ) {
        return true;
      }
      // 否則，沒必要出現 Load more replies 按鈕，返回 false
      return false;
    }

    // 如果該留言是母留言，那自然也不需要出現 Load more replies 按鈕，直接返回 false
    return false;
  };

  // 手動控制選項框的顯示與隱藏
  const handleOptionsPanelCollapse = () => {
    setIsCollapse(!isCollapse);
  };

  // 當 CommentCardOptionsPanel 失焦時，隱藏選項框
  const handleOptionsPanelOnBlur = () => {
    const timeout = setTimeout(() => {
      setIsCollapse(false);
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  };

  // 編輯留言
  const handleEditComment = () => {
    if (!access_token) {
      return toast.error("Please login first before edit");
    }

    if (username !== authUsername) {
      return toast.error("You not allowed to edit this comment");
    }

    setEditComment({ status: true, data: commentData });
  };

  // 根據留言卡寬度決定是否調整留言版面寬度
  useEffect(() => {
    // 如果當前留言卡的 childrenLevel 等於最大 childrenLevel
    if (commentData.childrenLevel === maxChildrenLevel) {
      const minCommentCardLimit = 250;

      // 就看留言卡的寬度是否小於等於能接受的最小寬度(minCommentCardLimit)
      // 這裏用 setTimeout 來延遲時間，讓 ref 有足夠的時間取得留言卡的寬度
      const timeout = setTimeout(() => {
        const cardRef = commentCardRef.current;

        if (cardRef) {
          const cardWidth = cardRef.offsetWidth ?? 0;

          // 如果小於 minCommentCardLimit，
          // 就設定 adjustWidth 為 true，順帶記錄當前留言卡的寬度
          // incrementVal 是當前留言卡寬度與 minCommentCardLimit 的差值
          // 這樣每一次調整留言版面寬度都會是固定的差值
          // 且如果取消調整，也能恢復調整前的寬度(因爲這時候的差值也會變化)
          if (cardWidth < minCommentCardLimit) {
            setAdjustContainerWidth({
              ...adjustContainerWidth,
              maxChildrenLevel,
              commentCardWidth: cardWidth,
              incrementVal: minCommentCardLimit - cardWidth,
              adjustWidth: true,
            });
          }
          // 如果是大於，還是得記錄當前留言卡的寬度
          // 因爲我們需要讓 adjustContainerWidth 有變化，這樣才能觸發 container.component 的 useEffect
          // 進而調整留言版面的寬度
          else {
            setAdjustContainerWidth({
              ...adjustContainerWidth,
              maxChildrenLevel,
              commentCardWidth: cardWidth,
              incrementVal: minCommentCardLimit - cardWidth,
            });
          }
        }
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [maxChildrenLevel]);

  return (
    <div
      className="w-full"
      style={{
        paddingLeft: `${
          options ? `${leftVal * paddingLeftIncrementVal}px` : ""
        }`,
      }}
    >
      <div
        ref={commentCardRef}
        className="
          group
          flex
          flex-col
          my-5
          p-6
          gap-6
          rounded-md
          border
          border-grey-custom
          "
      >
        {/* Comment user info */}
        <div
          className="
            flex
            gap-5
            items-center
          "
        >
          {/* Avatar && Fullname */}
          <Link
            to={`/user/${username}`}
            className="
              flex 
              w-[80%]
              gap-3
              items-center
            "
          >
            <img
              src={profile_img}
              className="
                w-8
                h-8 
                rounded-full
              "
            />

            <p className="truncate">
              <span>{fullname} </span>
              <span>·</span>
              <span className="text-blue-500"> @{username}</span>
            </p>
          </Link>

          {/* Date */}
          <p
            className="
              ml-auto
              line-clamp-1
              text-grey-dark/60
            "
          >
            {getDay(commentedAt ?? "")}
          </p>
        </div>

        {/* Comment content - whitespace-pre-wrap 可以保留文本換行符 */}
        <p
          className="
            ml-3
            text-lg
            font-gelasio
            truncate
            whitespace-pre-wrap
          "
        >
          {comment}
        </p>

        {/* Reply && Delete && Comments && Edit*/}
        <>
          {options && (
            <div
              ref={commentOptionsRef}
              className="
                flex
                items-center
              "
            >
              {/* Comments button */}
              <div className="flex mr-5">
                {commentData.isReplyLoaded ? (
                  <button
                    className="
                      text-grey-dark/60
                      hover:text-grey-dark/80
                      hover:underline
                      underline-offset-2
                      transition
                    "
                    onClick={() => handleHideReplies(index)}
                  >
                    Hide
                  </button>
                ) : (
                  <button
                    onClick={handleLoadReplies}
                    className="
                      flex
                      gap-2
                      text-grey-dark/60
                      hover:text-grey-dark/80
                      transition
                    "
                  >
                    <FlatIcons name="fi fi-rs-comment-dots" />
                    {commentData?.children?.length}
                  </button>
                )}
              </div>

              {/* Reply Button && Edit Button && Delete Button */}
              {optionsCollapse ? (
                // ReplyBtn && EditBtn && DeleteBtn (particular situation)
                <>
                  <div className="relative ml-auto">
                    <button
                      onBlur={handleOptionsPanelOnBlur}
                      onClick={handleOptionsPanelCollapse}
                      className="
                        px-3
                        text-grey-dark/60
                        hover:text-grey-dark/80
                        transition
                      "
                    >
                      <FlatIcons name="fi fi-sr-menu-dots-vertical" />
                    </button>

                    {isCollapse && (
                      <CommentCardOptionsPanel
                        access_token={access_token}
                        authUsername={authUsername}
                        commentUsername={username}
                        blogAuthorUsername={blogAuthorUsername}
                        handleReply={handleReply}
                        handleEditComment={handleEditComment}
                        handleDeleteWarning={handleDeleteWarning}
                      />
                    )}
                  </div>
                </>
              ) : (
                // ReplyBtn && EditBtn && DeleteBtn (normal situation)
                <>
                  <div
                    className="
                      flex
                      gap-5
                      items-center
                    "
                  >
                    {/* Reply button */}
                    <button
                      onClick={handleReply}
                      className="
                        text-grey-dark/60
                        hover:text-grey-dark/80
                        hover:underline
                        underline-offset-2
                        transition
                      "
                    >
                      Reply
                    </button>

                    {/* Edit button */}
                    <div>
                      {(access_token && authUsername === username) ||
                      !access_token ? (
                        <button
                          onClick={handleEditComment}
                          className="
                            text-grey-dark/60
                            hover:text-grey-dark/80
                            hover:underline
                            underline-offset-2
                            transition
                          "
                        >
                          Edit
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  {/* Delete Button*/}
                  <div className="ml-auto">
                    {/* 1. deleteBtn 是選擇性參數，是讓使用者決定是否要在 card 中顯示 deletebutton
                    2. 如果有登入，且是該 Blog 的作者，那有權限刪除所有的 comment
                    3. 如果有登入，且是該 comment 的作者，那有權限刪除自己的 comment
                    4. 如果沒有登入，就顯示所有的 delete button(但並沒有權限刪除，必須登入後才能刪除) */}
                    {(access_token && authUsername === blogAuthorUsername) ||
                    (access_token && authUsername === username) ||
                    !access_token ? (
                      <button
                        disabled={deleteBtnDisabled}
                        onClick={handleDeleteWarning}
                        className="
                          p-2
                          px-3
                          rounded-md
                          border
                          border-grey-custom
                          text-grey-dark/60
                          hover:bg-red-custom/30
                          hover:text-red-custom
                        "
                      >
                        <FlatIcons name="fi fi-rr-trash" />
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>

        {/* Reply Comment Box */}
        <>
          {isReplying && (
            <AnimationWrapper
              key="reply-comment-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="
                flex
                flex-col
                gap-6
              "
            >
              <hr className="border-grey-custom" />
              <BlogCommentField
                action="reply"
                placeholder={`Reply to ${
                  authUsername === username ? "yourself" : `@${username}`
                }`}
                index={index}
                replyingTo={commentObjectId}
                replyState={{ isReplying, setIsReplying }}
                showButton={true}
              />
            </AnimationWrapper>
          )}
        </>
      </div>

      {/* Loadmore Replies Button */}
      {isLoadMoreReplies() && (
        <button
          onClick={handleLoadMoreReplies}
          className="
            flex
            -mt-2
            pb-2
            text-grey-dark/40
            hover:text-grey-dark/50
            transition
          "
        >
          Load more replies
        </button>
      )}
    </div>
  );
};

export default BlogCommentCard;
