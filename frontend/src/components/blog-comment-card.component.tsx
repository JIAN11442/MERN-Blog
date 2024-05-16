import { Link } from 'react-router-dom';

import useAuthStore from '../states/user-auth.state';
import useBlogCommentStore from '../states/blog-comment.state';

import { getDay } from '../commons/date.common';
import type {
  AuthorProfileStructureType,
  GenerateCommentStructureType,
} from '../commons/types.common';
import toast from 'react-hot-toast';
import { useState } from 'react';
import BlogCommentField from './blog-comment-field.component';

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
  const { comment, commented_by, commentedAt } = commentData;
  const {
    personal_info: { username, fullname, profile_img },
  } = commented_by as AuthorProfileStructureType;

  const [isReplying, setIsReplying] = useState(false);

  const { authUser } = useAuthStore();
  const { access_token, username: authUsername } = authUser ?? {};

  const { setDeletedComment } = useBlogCommentStore();

  const handleDeleteWarning = () => {
    setDeletedComment({ state: true, comment: commentData });
  };

  const handleReply = () => {
    if (!access_token) {
      toast.error('Please login first to leave a reply');
    }

    setIsReplying(!isReplying);
  };

  return (
    <div
      className={`
        w-full
        pl-[${leftVal * 10}px]
      `}
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

        {/* Reply && Delete */}
        <>
          {options && (
            <div
              className="
                flex
                gap-5
                items-center
              "
            >
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

              {/* Delete Button
                1. deleteBtn 是選擇性參數，是讓使用者決定是否要在 card 中顯示 deletebutton
                2. 如果有登入，就只在自己的 comment 中顯示 delete button
                3. 如果沒有登入，就顯示所有的 delete button(但並沒有權限刪除，必須登入後才能刪除)
              */}
              {(access_token && authUsername === username) || !access_token ? (
                <button
                  onClick={handleDeleteWarning}
                  className="
                    text-grey-dark/60
                    hover:text-grey-dark/80
                    hover:underline
                    underline-offset-2
                    transition
                    opacity-0
                    group-hover:opacity-100
                  "
                >
                  Delete
                </button>
              ) : (
                ''
              )}
            </div>
          )}
        </>

        {/* Reply Comment Box */}
        <>
          {isReplying && (
            <div>
              <hr className="-mt-3 mb-3 border-grey-custom" />

              <BlogCommentField action="Reply" />
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default BlogCommentCard;
