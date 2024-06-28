import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import useCommentFetch from "../fetchs/comment.fetch";

import useAuthStore from "../states/user-auth.state";
import useTargetBlogStore from "../states/target-blog.state";
import useBlogCommentStore from "../states/blog-comment.state";
import { twMerge } from "tailwind-merge";
import { FlatIcons } from "../icons/flaticons";
import BlogCommentCard from "./blog-comment-card.component";
import {
  AuthorStructureType,
  GenerateCommentStructureType,
} from "../commons/types.common";

interface BlogCommentFieldProps {
  action: string;
  index?: number;
  placeholder?: string;
  replyingTo?: string;
  replyState?: {
    isReplying: boolean;
    setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  };
  showButton?: boolean;
  className?: string;
}

const BlogCommentField: React.FC<BlogCommentFieldProps> = ({
  action,
  index,
  placeholder,
  replyingTo,
  replyState,
  showButton = false,
  className,
}) => {
  const [comment, setComment] = useState("");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { authUser } = useAuthStore();
  const { targetBlogInfo } = useTargetBlogStore();
  const { results: commentsArr } = targetBlogInfo.comments ?? {};

  const {
    editComment,
    isEditedComment,
    setIsCommented,
    setEditComment,
    setIsEditedComment,
    setIsEditWarning,
  } = useBlogCommentStore();

  const {
    AddCommentToBlog,
    LoadRepliesCommentById,
    UpdateTargetCommentContent,
  } = useCommentFetch();

  // 監聽輸入值並儲存
  // isCommented 也要設為 false, 為下一次留言做準備
  // 設定留言框的高度可以隨著內容自動增加
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setComment(input.value);

    setIsCommented(false);

    // Auto resize the textarea with the content While replying
    if (replyingTo) {
      input.style.height = "auto";
      input.style.height = `${input.scrollHeight + 2}px`;
    }
  };

  // 上傳留言至數據庫
  const handleCommentFunc = async () => {
    // 如果沒有登入，就不給予留言的權限
    if (!authUser?.access_token || !textareaRef.current) {
      return toast.error(`Please login first before ${action}`);
    }

    // 如果當前是回覆留言模式，
    // 且母留言有回覆留言及並未展開
    // 那麼要先展開並加載原回覆留言
    if (replyingTo && index !== undefined && commentsArr) {
      if (
        (commentsArr[index].children?.length ?? 0) > 0 &&
        !commentsArr[index].isReplyLoaded
      ) {
        await LoadRepliesCommentById({
          repliedCommentId: replyingTo,
          index,
          commentsArr,
        });
      }

      // 如果是第一次留言，則不需要加載回覆留言，但需要設定為已加載(因為新留言會出現)
      // 如果不是第一次留言，則需要加載回覆留言，同時一樣得設定為已加載(加載後再植入新留言)
      commentsArr[index].isReplyLoaded = true;
    }

    // 在開始更新或新增留言前，就禁用留言框
    // 防止重複提交
    textareaRef.current.disabled = true;

    // 如果當前是編輯模式，則更新留言
    if (action === "edit") {
      await UpdateTargetCommentContent({
        commentObjId: editComment?.data?._id,
        newCommentContent: comment,
      });

      setEditComment({ status: false, data: null });

      toast.success("Comment updated successfully!");
    }
    // 反之，可能就是 comment 或 reply 模式，
    // 那就新增留言(不管是數據庫或 zustand 庫的資料都更新)
    else {
      await AddCommentToBlog({
        blogObjId: targetBlogInfo._id,
        comment,
        blog_author: (targetBlogInfo.author as AuthorStructureType)?._id,
        replying_to: replyingTo,
        index: index,
        replyState: replyState,
      });
    }

    // 最後清空留言記錄
    setComment("");

    // 以及清空留言框的內容，並恢復可用狀態
    textareaRef.current.value = "";
    textareaRef.current.disabled = false;

    // 另外，只有在留言頭留言時才會設定 isCommented 為 true；回覆留言時不會
    // 因為我只希望在留言頭留言時，留言框可以自動捲動到最底部
    // 而回覆留言時，保留在原地即可
    if (!replyingTo) {
      setIsCommented(true);
    }
  };

  // 如果是通過 Enter 提交留言
  const handleEnterSubmit = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      await handleCommentFunc();
    }
  };

  // 如果是通過按鈕提交留言
  const handleButtonSubmit = async () => {
    if (buttonRef.current) {
      const target = buttonRef.current;

      // 防止連續點擊
      target.disabled = true;

      await handleCommentFunc();

      // 恢復按鈕
      target.disabled = false;
    }
  };

  // 關閉編輯狀態
  const handleIsEditCloseBtn = async () => {
    const timeout = setTimeout(() => {
      if (isEditedComment) {
        setIsEditWarning(true);
      } else {
        setEditComment({ status: false, data: null });
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  };

  // 當載入組件是，自動 focus 在 textarea 上
  useEffect(() => {
    if (textareaRef.current) {
      if (action === "edit") {
        textareaRef.current.value = editComment.data?.comment ?? "";

        const handleMouseDown = (event: MouseEvent) => {
          if (event.target !== textareaRef.current) {
            event.preventDefault();
          }
        };

        textareaRef.current.focus();
        document.addEventListener("mousedown", handleMouseDown);

        return () => {
          document.removeEventListener("mousedown", handleMouseDown);
        };
      }

      textareaRef.current.focus();
    }
  }, [editComment]);

  // 如果當前編輯的留言内容與編輯前不同，則設定為已編輯
  // 這樣才能激活編輯按鈕
  useEffect(() => {
    if (comment.length && comment !== editComment.data?.comment) {
      setIsEditedComment(true);
    } else {
      setIsEditedComment(false);
    }
  }, [comment]);

  return (
    <div
      className={twMerge(
        `
      ${
        editComment.status &&
        action === "edit" &&
        `
          flex
          flex-col
          gap-5
          justify-center
        `
      }
    `,
        className
      )}
    >
      {/* Edit Title && Close Button && Preview Comment Card */}
      {action === "edit" && editComment.status && (
        <div
          className="
            flex
            flex-col
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            {/* Edit Title */}
            <p className="font-semibold">Edit Comment</p>

            {/* Close Button */}
            <button onClick={handleIsEditCloseBtn}>
              <FlatIcons
                name="fi fi-sr-circle-xmark"
                className="
                  text-2xl
                  text-grey-dark/40
                  opacity-30
                  hover:opacity-100
                  transition
                "
              />
            </button>
          </div>

          {/* Preview */}
          <BlogCommentCard
            index={1}
            commentData={editComment.data as GenerateCommentStructureType}
            leftVal={10}
            options={false}
          />
        </div>
      )}

      {/* Comment Box && Action Button */}
      <div
        className={`
          ${
            action === "edit" &&
            editComment.status &&
            `
              flex
              gap-3
            `
          }
        `}
      >
        {/* Comment Box */}
        <textarea
          ref={textareaRef}
          placeholder={placeholder || "Leave a comment..."}
          onChange={(e) => handleInput(e)}
          onKeyDown={(e) => handleEnterSubmit(e)}
          className={`
            input-box
            pl-5
            placeholder:text-grey-dark/50
            resize-none
            w-full
            overflow-hidden
            overflow-y-auto
            ${replyingTo ? `max-h-[250px]` : ""}
          `}
        ></textarea>

        {/* Action button */}
        {showButton ? (
          editComment.status && action === "edit" ? (
            <button
              ref={buttonRef}
              onClick={handleButtonSubmit}
              disabled={!isEditedComment}
              className="
                flex
                pt-1
                items-center
                justify-center
              "
            >
              <FlatIcons
                name="fi fi-ss-check-circle"
                className={`
                  text-2xl
                  ${
                    isEditedComment
                      ? `
                        text-blue-500
                        hover:text-blue-600
                        `
                      : `
                        text-grey-dark/40
                        opacity-30
                        `
                  }
                `}
              />
            </button>
          ) : (
            <button
              ref={buttonRef}
              onClick={handleButtonSubmit}
              className="
                btn-dark
                mt-3
                px-5
                py-2
                rounded-full
              "
            >
              {action}
            </button>
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default BlogCommentField;
