import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import useCommentFetch from '../fetchs/comment.fetch';

import useAuthStore from '../states/user-auth.state';
import useTargetBlogStore from '../states/target-blog.state';
import useBlogCommentStore from '../states/blog-comment.state';

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
  const [comment, setComment] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { authUser } = useAuthStore();
  const { targetBlogInfo } = useTargetBlogStore();
  const { results: commentsArr } = targetBlogInfo.comments ?? {};

  const { setIsCommented } = useBlogCommentStore();

  const { AddCommentToBlog, LoadRepliesCommentById } = useCommentFetch();

  // 監聽輸入值並儲存
  // isCommented 也要設為 false, 為下一次留言做準備
  // 設定留言框的高度可以隨著內容自動增加
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setComment(input.value);

    setIsCommented(false);

    // Auto resize the textarea with the content While replying
    if (replyingTo) {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight + 2}px`;
    }
  };

  // 上傳留言至數據庫
  const handleCommentFunc = async () => {
    // 如果沒有登入，就不給予留言的權限
    if (!authUser?.access_token) {
      return toast.error(`Please login first before ${action}`);
    }

    // 如果當前是回覆留言模式，
    // 且母留言有回覆留言及並未展開
    // 那麼要先展開並加載原回覆留言
    if (
      replyingTo &&
      index !== undefined &&
      commentsArr &&
      (commentsArr[index].children?.length ?? 0) > 0 &&
      !commentsArr[index].isReplyLoaded
    ) {
      commentsArr[index].isReplyLoaded = true;

      await LoadRepliesCommentById({
        repliedCommentId: replyingTo,
        index,
        commentsArr,
      });
    }

    // 再加入新留言
    await AddCommentToBlog({
      blogObjectId: targetBlogInfo._id,
      comment,
      blog_author: targetBlogInfo.author?._id,
      replying_to: replyingTo,
      index: index,
      replyState: replyState,
    });

    // 最後清空留言框
    setComment('');

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      await handleCommentFunc();
    }
  };

  // 如果是通過按鈕提交留言
  const handleButtonSubmit = async () => {
    if (buttonRef.current) {
      // 防止連續點擊
      buttonRef.current.disabled = true;

      await handleCommentFunc();

      // 恢復按鈕
      buttonRef.current.disabled = false;
    }
  };

  // 當載入組件是，自動 focus 在 textarea 上
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  return (
    <div className={className}>
      {/* Comment Box */}
      <textarea
        ref={textAreaRef}
        value={comment}
        placeholder={placeholder || 'Leave a comment...'}
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
          ${replyingTo ? `max-h-[250px]` : ''}
        `}
      ></textarea>

      {/* Action button */}
      {showButton && (
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
      )}
    </div>
  );
};

export default BlogCommentField;
