import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AnimationWrapper from "./page-animation.component";

import useAuthStore from "../states/user-auth.state";
import useDashboardStore from "../states/dashboard.state";

import useCommentFetch from "../fetchs/comment.fetch";

import {
  AuthorStructureType,
  BlogStructureType,
  CommentStructureType,
  GenerateCommentStructureType,
  NotificationStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";

interface NotificationCardProps {
  index: number;
  state?: string;
  data: NotificationStructureType;
  currFilterBtn?: React.RefObject<HTMLButtonElement>;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  index,
  state = "notification",
  data,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isReplying, setIsReplying] = useState(false);
  const [content, setContent] = useState("");

  const {
    _id,
    user,
    type,
    replied_on_comment,
    blog,
    comment: notificationComment,
    reply: notificationReply,
    createdAt,
  } = data;

  const { personal_info } = (user as AuthorStructureType) ?? {};
  const { fullname, username, profile_img } = personal_info ?? {};

  const {
    _id: blogObjId,
    blog_id,
    title,
    author: blogAuthorId,
  } = (blog as BlogStructureType) ?? {};

  const { comment } =
    (replied_on_comment as GenerateCommentStructureType) ?? {};

  const { _id: replyId, comment: replyContent } =
    (notificationComment as CommentStructureType) ?? {};

  const { comment: replyComment } =
    (notificationReply as CommentStructureType) ?? {};

  const { authUser } = useAuthStore();
  const commented_by = {
    personal_info: {
      fullname: authUser?.fullname,
      username: authUser?.username,
      profile_img: authUser?.profile_img,
    },
  };

  const { setActiveRemoveWarningModal, setActiveDeleteWarningModal } =
    useDashboardStore();

  const { AddCommentToBlog } = useCommentFetch();

  // 控制展開 Reply Box
  const handleReply = () => {
    setIsReplying(!isReplying);
  };

  // 監聽並儲存 textarea 的內容
  // 同時根據內容自動調整輸入框高度
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setContent(input.value);

    input.style.height = "auto";
    input.style.height = `${input.scrollHeight + 2}px`;
  };

  // 新增回覆留言
  const handleEnterSubmit = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey && textareaRef.current) {
      e.preventDefault();

      textareaRef.current.disabled = true;

      await AddCommentToBlog({
        blogObjId,
        comment: content,
        blog_author: blogAuthorId as string,
        replying_to: replyId,
        notificationId: _id,
        notificationIndex: index,
      });

      textareaRef.current.value = "";
      textareaRef.current.disabled = false;

      toast.success("reply successfully");

      setIsReplying(false);
    }
  };

  // 開啟移除警告視窗
  const handleActiveRemoveWarningModal = () => {
    setActiveRemoveWarningModal({ state: true, index, data });
  };

  // 開啟刪除警告視窗
  const handleActiveDeleteWarningModal = () => {
    setActiveDeleteWarningModal({
      state: true,
      index,
      data,
    });
  };

  // 當展開 Reply Box 時，自動 focus
  useEffect(() => {
    if (isReplying) {
      textareaRef.current?.focus();
    }
  }, [isReplying]);

  return (
    <div
      className={`
        p-6
        ${
          state === "warning"
            ? `
                border
                rounded-md
                shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
               shadow-grey-dark/5
              `
            : `
                border-b
                max-w-[600px]
              `
        }
        border-grey-custom
      `}
    >
      <div
        className="
          flex
          gap-5
        "
      >
        {/* Avatar */}
        <img
          src={profile_img}
          className="
            w-12
            h-12
            rounded-full
            border
            border-grey-custom
          "
        />

        {/* Content */}
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
                        shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
                      shadow-grey-dark/10
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
                        shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
                      shadow-grey-dark/10
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
          <>
            {state !== "warning" && (
              <div
                className={`
                  flex
                  w-full
                  gap-5
                  items-center
                `}
              >
                {/* Notification Time ago */}
                <p className="text-grey-dark/50">{getTimeAgo(createdAt!)}</p>

                {/* Options Button */}
                <div className="flex gap-5">
                  {!notificationReply && type !== "like" && (
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
                  )}

                  <button
                    onClick={handleActiveRemoveWarningModal}
                    className="
                      text-grey-dark/50
                      hover:text-grey-dark/80
                      hover:underline
                      underline-offset-2
                      transition
                    "
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>

          {/* Reply */}
          <>
            {/* Reply Box */}
            {isReplying && (
              <AnimationWrapper
                keyValue="notification-reply-box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <textarea
                  ref={textareaRef}
                  placeholder={`Reply to @${username}`}
                  onChange={(e) => handleInput(e)}
                  onKeyDown={(e) => handleEnterSubmit(e)}
                  className={`
                    input-box
                    pl-5
                    max-h-[200px]
                    placeholder:text-grey-dark/50
                    resize-none
                    w-full
                    overflow-hidden
                    overflow-y-auto
                  `}
                ></textarea>
              </AnimationWrapper>
            )}

            {/* reply message */}
            {notificationReply ? (
              <div
                className="
                  p-4
                  bg-grey-custom/70
                  rounded-md
                "
              >
                <div
                  className="
                    flex
                    gap-3
                    items-center
                  "
                >
                  <img
                    src={authUser?.profile_img}
                    className="
                      w-9
                      h-9
                      rounded-full
                      shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
                    shadow-grey-dark/5
                    "
                  />

                  <h1
                    className="
                      font-medium
                      text-xl
                      text-grey-dark
                      line-clamp-1
                    "
                  >
                    <Link
                      to={`/user/${authUser?.username}`}
                      className="
                        text-blue-500
                        hover:underline
                        transition
                        mx-1
                      "
                    >
                      @{authUser?.username}
                    </Link>

                    <span className="font-normal">replied to</span>

                    <Link
                      to={`/user/${username}`}
                      className="
                        text-blue-500
                        hover:underline
                        transition
                        mx-1
                      "
                    >
                      @{username}
                    </Link>
                  </h1>
                </div>

                <p
                  className="
                    my-2
                    ml-14
                    text-green-600
                    line-clamp-1
                  "
                >
                  {replyComment}
                </p>

                <button
                  onClick={handleActiveDeleteWarningModal}
                  className="
                    ml-14
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
            ) : (
              ""
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
