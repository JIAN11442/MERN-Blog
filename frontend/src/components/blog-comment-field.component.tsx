import { useState } from 'react';
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

  const { authUser } = useAuthStore();
  const { targetBlogInfo } = useTargetBlogStore();
  const { setIsCommented } = useBlogCommentStore();

  const { AddCommentToBlog } = useCommentFetch();

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

      if (!authUser?.access_token) {
        return toast.error(`Please login first before ${action}`);
      }

      AddCommentToBlog({
        blogObjectId: targetBlogInfo._id,
        comment,
        blog_author: targetBlogInfo.author?._id,
        replying_to: replyingTo,
        index: index,
        replyState: replyState,
      });

      setComment('');

      // 只有在留言頭留言時才會設定 isCommented 為 true；回覆留言時不會
      // 因為我只希望在留言頭留言時，留言框可以自動捲動到最底部
      // 而回覆留言時，保留在原地即可
      if (!replyingTo) {
        setIsCommented(true);
      }
    }
  };

  return (
    <div className={className}>
      {/* Comment Box */}
      <textarea
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
