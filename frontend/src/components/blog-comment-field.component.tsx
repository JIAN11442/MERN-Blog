import toast from 'react-hot-toast';

import useAuthStore from '../states/user-auth.state';
import useCommentFetch from '../fetchs/comment.fetch';
import useTargetBlogStore from '../states/target-blog.state';
import useBlogCommentStore from '../states/blog-comment.state';

interface BlogCommentFieldProps {
  action: string;
}

const BlogCommentField: React.FC<BlogCommentFieldProps> = ({ action }) => {
  const { authUser } = useAuthStore();
  const { targetBlogInfo } = useTargetBlogStore();
  const { comment, setComment } = useBlogCommentStore();

  const { AddCommentToBlog } = useCommentFetch();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setComment(input.value);

    // Auto resize the textarea with the content
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight + 2}px`;
  };

  const handleAction = () => {
    if (!authUser?.access_token) {
      return toast.error(`Please login first before ${action}`);
    }

    AddCommentToBlog({
      blogObjectId: targetBlogInfo._id,
      comment,
      blog_author: targetBlogInfo.author?._id,
    });
  };

  return (
    <>
      {/* Comment Box */}
      <textarea
        value={comment}
        onChange={(e) => handleInput(e)}
        placeholder="Leave a comment..."
        className="
          input-box
          pl-5
          placeholder:text-grey-dark
          resize-none
          w-full
          min-h-[150px]
          max-h-[300px]
          overflow-hidden
          overflow-y-auto
        "
      ></textarea>

      {/* Action button */}
      <button
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
      </button>
    </>
  );
};

export default BlogCommentField;
