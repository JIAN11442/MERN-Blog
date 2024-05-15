import toast from "react-hot-toast";

import useCommentFetch from "../fetchs/comment.fetch";

import useAuthStore from "../states/user-auth.state";
import useTargetBlogStore from "../states/target-blog.state";
import useBlogCommentStore from "../states/blog-comment.state";

interface BlogCommentFieldProps {
  action: string;
  className?: string;
}

const BlogCommentField: React.FC<BlogCommentFieldProps> = ({
  action,
  className,
}) => {
  const { authUser } = useAuthStore();
  const { targetBlogInfo } = useTargetBlogStore();

  const { comment, setComment } = useBlogCommentStore();

  const { AddCommentToBlog } = useCommentFetch();

  // 監聽輸入值
  // 設定留言框的高度可以隨著內容自動增加
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setComment(input.value);

    // Auto resize the textarea with the content
    // input.style.height = "auto";
    // input.style.height = `${input.scrollHeight + 2}px`;
  };

  // 上傳留言道數據庫
  const handleAction = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!authUser?.access_token) {
        return toast.error(`Please login first before ${action}`);
      }

      AddCommentToBlog({
        blogObjectId: targetBlogInfo._id,
        comment,
        blog_author: targetBlogInfo.author?._id,
      });
    }
  };

  return (
    <div className={className}>
      {/* Comment Box */}
      <textarea
        value={comment}
        placeholder="Leave a comment..."
        onChange={(e) => handleInput(e)}
        onKeyDown={(e) => handleAction(e)}
        className="
          input-box
          pl-5
          placeholder:text-grey-dark
          resize-none
          w-full
          overflow-hidden
          overflow-y-auto
        "
      ></textarea>

      {/* Action button */}
      {/* <button
        onClick={handleAction}
        className="
          btn-dark
          mt-3
          px-5
          py-2
          rounded-md
        "
      >
        {action}
      </button> */}
    </div>
  );
};

export default BlogCommentField;
