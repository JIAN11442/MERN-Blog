import { Link } from "react-router-dom";

import useAuthStore from "../states/user-auth.state";

import {
  AuthorStructureType,
  BlogStructureType,
  CommentStructureType,
  GenerateCommentStructureType,
  NotificationStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";
import { useState } from "react";
import AnimationWrapper from "./page-animation.component";
import BlogCommentField from "./blog-comment-field.component";

interface NotificationCardProps {
  index: number;
  notification: NotificationStructureType;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  index,
  notification,
}) => {
  const [isReplying, setIsReplying] = useState(false);

  const {
    user,
    type,
    replied_on_comment,
    blog,
    comment: reply,
    createdAt,
  } = notification;
  const { personal_info } = (user as AuthorStructureType) ?? {};
  const { fullname, username, profile_img } = personal_info ?? {};
  const { blog_id, title } = (blog as BlogStructureType) ?? {};
  const { comment } =
    (replied_on_comment as GenerateCommentStructureType) ?? {};
  const { comment: replyContent } = (reply as CommentStructureType) ?? {};

  const { authUser } = useAuthStore();

  const commented_by = {
    personal_info: {
      fullname: authUser?.fullname,
      username: authUser?.username,
      profile_img: authUser?.profile_img,
    },
  };

  const handleReply = () => {
    setIsReplying(!isReplying);
  };

  return (
    <div
      className="
        p-6
        border-b
        border-grey-custom
        border-l-black-custom
      "
    >
      <div
        className="
          flex
          gap-5
        "
      >
        <img
          src={profile_img}
          className="
            w-12
            h-12
            rounded-full
          "
        />

        <div
          className="
            flex
            flex-col
            gap-5
          "
        >
          {/* Notification Content */}
          <div
            className={`
              w-full
                ${
                  type === "comment" &&
                  `
                    flex
                    gap-1
                  `
                }
              `}
          >
            {/* row */}
            <h1
              className="
                gap-1
                font-medium
                text-xl
                text-grey-dark
                items-start
                line-clamp-3
              "
            >
              {/* Fullname */}
              <span
                className="
                  hidden
                  lg:inline-block
                  capitalize
                "
              >
                <span className="mr-1">{fullname}</span>
                <span className="mr-1">·</span>
              </span>

              {/* Username */}
              <Link
                to={`/user/${username}`}
                className="
                  text-blue-500
                  hover:underline
                  mr-1
                "
              >
                @{username}
              </Link>

              {/* notification state */}
              <span
                className="
                  font-normal 
                  mr-1
                "
              >
                {type === "like"
                  ? "liked your blog"
                  : type === "comment"
                  ? `commented on a blog that you're created`
                  : "replied on blog"}
              </span>

              {/* blog title */}
              <Link
                to={`/blog/${blog_id}`}
                className="
                  font-semibold
                  hover:underline
                "
              >
                {title}
              </Link>

              {/* reply row content */}
              <>
                {type === "reply" ? (
                  <span
                    className="
                      font-normal
                      ml-1
                    "
                  >
                    that you commented:
                  </span>
                ) : type === "comment" ? (
                  <span
                    className="
                      font-normal
                      text-green-600
                    "
                  >
                    : "{replyContent}"
                  </span>
                ) : (
                  ""
                )}
              </>
            </h1>

            {/* column */}
            <>
              {type === "reply" && (
                // Reply Content
                <div
                  className="
                    mt-5
                    p-4
                    lg:max-w-[550px]
                    border
                    border-grey-custom
                    rounded-md
                    shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
                  shadow-grey-dark/5
                  "
                >
                  <div
                    className="
                      flex
                      gap-4
                      items-center
                    "
                  >
                    <img
                      src={commented_by.personal_info.profile_img}
                      className="
                        w-9
                        h-9
                        rounded-full
                      "
                    />

                    <p>{comment}</p>
                  </div>

                  <div
                    className="
                      flex
                      mt-1
                      w-full
                      pl-10
                      gap-4
                      items-center
                    "
                  >
                    <img
                      src={profile_img}
                      className="
                        w-9
                        h-9
                        rounded-full
                      "
                    />
                    <div
                      className="
                        w-full
                        py-3
                        px-4
                        bg-grey-custom
                        rounded-md
                      "
                    >
                      <p className="text-green-600">{replyContent}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          </div>

          {/* Date && Options Button */}
          <div
            className={`
              flex
              gap-5
              items-center
            `}
          >
            {type !== "like" && (
              <div className="flex gap-5">
                <button
                  onClick={handleReply}
                  className="
                    text-grey-dark/50
                    hover:text-grey-dark/80
                    hover:underline
                    underline-offset-2
                    transition
                  "
                >
                  Reply
                </button>

                <button
                  className="
                    text-grey-dark/50
                    hover:text-grey-dark/80
                    hover:underline
                    underline-offset-2
                    transition
                  "
                >
                  Delete
                </button>
              </div>
            )}

            {/* Notification Time ago */}
            <p className="text-grey-dark/50">{getTimeAgo(createdAt!)}</p>
          </div>

          {/* Reply Box */}
          <>
            {isReplying && (
              <AnimationWrapper
                keyValue="notification-reply-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <textarea
                  placeholder={`Reply to @${username}`}
                  className={`
                    input-box
                    pl-5
                    placeholder:text-grey-dark/50
                    resize-none
                    w-full
                    overflow-hidden
                    overflow-y-auto
                  `}
                ></textarea>
              </AnimationWrapper>
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
