import BlogCommentField from './blog-comment-field.component';

import useBlogCommentStore from '../states/blog-comment.state';
import useTargetBlogStore from '../states/target-blog.state';

import { FlatIcons } from '../icons/flaticons';

const BlogCommentContainer = () => {
  const { commentsWrapper, setCommentsWrapper } = useBlogCommentStore();
  const {
    targetBlogInfo: { title },
  } = useTargetBlogStore();

  const handleCloseCommentContainer = () => {
    setCommentsWrapper(false);
  };

  return (
    <div
      className={`
        fixed
        w-[40%]
        min-w-[450px]
        max-sm:w-full
        max-sm:right-0
        sm:top-0
        sm:rounded-l-xl
        h-full
        p-8
        max-sm:px-12
        bg-white-custom
        shadow-2xl
        z-50
        duration-700
        overflow-y-auto
        overflow-x-hidden
        ${
          commentsWrapper
            ? `
                top-0
                sm:right-0
                opacity-100
              `
            : `
                top-[100%]
                sm:right-[-100%]
                opacity-0
              `
        }
      `}
    >
      {/* Header */}
      <div className="relative">
        {/* Comment Title */}
        <h1
          className="
            text-xl
            font-medium
          "
        >
          Comments
        </h1>

        {/* Blog Title */}
        <p
          className="
            text-md
            mt-2
            w-[70%]
            text-grey-dark
            line-clamp-1
          "
        >
          {title}
        </p>

        {/* Close Button */}
        <button
          onClick={handleCloseCommentContainer}
          className="
            absolute
            top-0
            right-0
          "
        >
          <FlatIcons
            name="fi fi-sr-circle-xmark"
            className="
              text-4xl
              text-grey-dark/40
              opacity-30
              hover:opacity-100
              transition
            "
          />
        </button>
      </div>

      {/* Separate Line */}
      <hr className="my-8 border-grey-custom" />

      {/* Comment Field */}
      <BlogCommentField action="comment" />
    </div>
  );
};

export default BlogCommentContainer;
