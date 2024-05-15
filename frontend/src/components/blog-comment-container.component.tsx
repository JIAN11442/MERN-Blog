import { useEffect } from "react";

import BlogCommentField from "./blog-comment-field.component";
import NoDataMessage from "./blog-nodata.component";
import AnimationWrapper from "./page-animation.component";
import BlogCommentCard from "./blog-comment-card.component";

import useTargetBlogStore from "../states/target-blog.state";
import useBlogCommentStore from "../states/blog-comment.state";

import { FlatIcons } from "../icons/flaticons";

import type { BlogStructureType } from "../commons/types.common";

const BlogCommentContainer = () => {
  const { commentsWrapper, setCommentsWrapper } = useBlogCommentStore();
  const { targetBlogInfo } = useTargetBlogStore();

  const {
    title,
    comments: { results: commentArr },
  } = targetBlogInfo as Required<BlogStructureType>;

  const handleCloseCommentContainer = () => {
    setCommentsWrapper(false);
  };

  useEffect(() => {
    if (commentArr) {
      console.log(commentArr);
    }
  }, [commentArr]);

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
        bg-white-custom
        shadow-2xl
        z-50
        duration-700
        overflow-hidden
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
      <div className="relative p-8 pb-0">
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
            top-8
            right-8
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

        {/* Separate Line */}
        <hr className="mt-8 mb-2 border-grey-custom" />
      </div>

      {/* Comment */}
      {commentArr.length ? (
        <div
          className="
            max-h-[75%]
            pl-8
            mr-8
            pr-4
            overflow-y-auto
            cstm-scrollbar
          "
        >
          {commentArr.map((data, i) => (
            <AnimationWrapper
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: commentsWrapper ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <BlogCommentCard
                index={i}
                commentData={data}
                leftVal={data.childrenLevel * 4}
              />
            </AnimationWrapper>
          ))}

          {/* Separate Line */}
          <hr className="mt-8 border-grey-custom" />
        </div>
      ) : (
        <NoDataMessage message="No comments" />
      )}

      {/* Comment Field */}
      <div
        className="
          absolute
          bottom-5
          w-full
          px-8
        "
      >
        <BlogCommentField action="comment" />
      </div>
    </div>
  );
};

export default BlogCommentContainer;
