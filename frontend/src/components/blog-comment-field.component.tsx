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
  className?: string;
}

const BlogCommentField: React.FC<BlogCommentFieldProps> = ({
  action,
  index,
  placeholder,
  replyingTo,
  replyState,
  className,
}) => {
  const [comment, setComment] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
  // 設定 isCommented 為 true, 代表已經 Enter 送出留言(為了之後觸發 scrollbar 用)
  const handleComment = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // 如果沒有登入，就不給予留言的權限
      if (!authUser?.access_token) {
        return toast.error(`Please login first before ${action}`);
      }

      // 如果當前是回覆留言模式，且並未展開被回覆留言
      // 那麼要先展開並加載原回覆留言
      if (
        replyingTo &&
        index !== undefined &&
        commentsArr &&
        !commentsArr[index].isReplyLoaded
      ) {
        commentsArr[index].isReplyLoaded = true;

        LoadRepliesCommentById({
          repliedCommentId: replyingTo,
          index,
          commentsArr,
        });
      }

      // 再加入新留言
      AddCommentToBlog({
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
    }
  };

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
        onKeyDown={(e) => handleComment(e)}
        className={`
          input-box
          pl-5
          placeholder:text-grey-dark
          resize-none
          w-full
          overflow-hidden
          overflow-y-auto
          ${replyingTo ? `max-h-[250px]` : ''}
        `}
      ></textarea>

      {/* Action button */}
      {action === 'Reply' && (
        <button
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
