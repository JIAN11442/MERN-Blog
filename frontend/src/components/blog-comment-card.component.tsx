import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import BlogCommentField from './blog-comment-field.component';
import AnimationWrapper from './page-animation.component';

import useAuthStore from '../states/user-auth.state';
import useBlogCommentStore from '../states/blog-comment.state';

import { getDay } from '../commons/date.common';
import type {
  AuthorProfileStructureType,
  BlogStructureType,
  GenerateCommentStructureType,
} from '../commons/types.common';
import useTargetBlogStore from '../states/target-blog.state';
import useCommentFetch from '../fetchs/comment.fetch';
import { FlatIcons } from '../icons/flaticons';

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

  const { setDeletedComment } = useBlogCommentStore();

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
  };

  const handleLoadReplies = () => {
    commentData.isReplyLoaded = true;

    LoadRepliesCommentById({
      repliedCommentId: commentObjectId,
      index,
      commentsArr,
    });
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

        {/* Reply && Delete && Comments */}
        <>
          {options && (
            <div
              className="
                flex
                items-center
              "
            >
              {/* Comment && Reply Buttton */}
              <div
                className="
                  flex
                  gap-5
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
              />
            </AnimationWrapper>
          )}
        </>
      </div>
    </div>
  );
};

export default BlogCommentCard;
