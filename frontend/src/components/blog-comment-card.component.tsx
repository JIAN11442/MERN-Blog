import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import BlogCommentField from './blog-comment-field.component';
import AnimationWrapper from './page-animation.component';

import useAuthStore from '../states/user-auth.state';
import useBlogCommentStore from '../states/blog-comment.state';
import useTargetBlogStore from '../states/target-blog.state';

import useCommentFetch from '../fetchs/comment.fetch';

import { FlatIcons } from '../icons/flaticons';

import { getDay } from '../commons/date.common';
import type {
  AuthorProfileStructureType,
  BlogStructureType,
  GenerateCommentStructureType,
} from '../commons/types.common';

interface BlogCommentCardProps {
  index: number;
  commentData: GenerateCommentStructureType;
  leftVal: number;
  options?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

const BlogCommentCard: React.FC<BlogCommentCardProps> = ({
  index,
  commentData,
  leftVal,
  options = true,
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

  const [isReplying, setIsReplying] = useState(false);

  const { authUser } = useAuthStore();
  const { access_token, username: authUsername } = authUser ?? {};

  const { targetBlogInfo, setTargetBlogInfo } = useTargetBlogStore();
  const {
    comments: { results: commentsArr },
    author: {
      personal_info: { username: blogAuthorUsername },
    },
  } = targetBlogInfo as Required<BlogStructureType>;

  const { setDeletedComment, setTotalRepliesLoaded, totalRepliesLoaded } =
    useBlogCommentStore();

  // 因為 totalRepliesLoaded 是一個陣列，且是隨著每次加載回覆留言而增加
  // 因此每一個 comment card 如果想要知道自己的母留言加載時記錄在 totalRepliesLoaded 的資訊位置(index)，
  // 就必須透過各自的 parentIndex 來找到，這一步就是透過 findIndex 來找到
  const indexOfRepliesLoadedInCurrCommentData = totalRepliesLoaded.findIndex(
    (item) => item.index === commentData.parentIndex
  );

  const { LoadRepliesCommentById } = useCommentFetch();

  const handleDeleteWarning = () => {
    if (!access_token) {
      return toast.error('You need to login to delete a comment');
    }
    setDeletedComment({ state: true, comment: commentData, index });
  };

  const handleReply = () => {
    if (!access_token) {
      return toast.error('Please login first before reply');
    }

    setIsReplying(!isReplying);
  };

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

      // console.log(
      //   `\n\n留言內容: ${commentData.comment}\n母留言的子留言數量: ${
      //     commentsArr[commentData.parentIndex ?? 0].children?.length ?? 0
      //   }\n已記錄母留言展開子留言數: ${
      //     totalRepliesLoaded[indexOfRepliesLoadedInCurrCommentData].loadedNum
      //   }\n當前母留言展開的所有ID: ${
      //     commentsArr[commentData.parentIndex ?? 0].children
      //   }\n當前母留言展開的最後一個子留言ID: ${
      //     commentsArr[commentData.parentIndex ?? 0].children?.[
      //       totalRepliesLoaded[indexOfRepliesLoadedInCurrCommentData]
      //         .loadedNum - 1
      //     ]
      //   }\n當前留言ID: ${commentData._id}\n\n`
      // );

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

  // 編輯留言
  const handleEditComment = () => {
    if (!access_token) {
      return toast.error('Please login first before edit');
    }
  };

  return (
    <div
      className="w-full"
      style={{ paddingLeft: `${options ? `${leftVal * 10}px` : ''}` }}
    >
      <div
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
            justify-between
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
              text-nowrap
              text-grey-dark/60
            "
          >
            {getDay(commentedAt ?? '')}
          </p>
        </div>

        {/* Comment content - whitespace-pre-wrap 可以保留文本換行符 */}
        <p
          className="
            ml-3
            text-lg
            font-gelasio
            whitespace-pre-wrap
          "
        >
          {comment}
        </p>

        {/* Reply && Delete && Comments && Edit*/}
        <>
          {options && (
            <div
              className="
                flex
                items-center
              "
            >
              {/* Comment && Reply Buttton && Edit */}
              <div
                className="
                  flex
                  gap-5
                  items-center
                "
              >
                {/* Comments button */}
                <div>
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
                      Hide Comments
                    </button>
                  ) : (
                    <button
                      onClick={handleLoadReplies}
                      className="
                        text-grey-dark/60
                        hover:text-grey-dark/80
                        transition
                      "
                    >
                      <p className="flex gap-2">
                        <FlatIcons name="fi fi-rs-comment-dots" />
                        {commentData?.children?.length} comments
                      </p>
                    </button>
                  )}
                </div>

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
                    ''
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
                  ''
                )}
              </div>
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
                action="Reply"
                placeholder={`Reply to ${
                  authUsername === username ? 'yourself' : `@${username}`
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
