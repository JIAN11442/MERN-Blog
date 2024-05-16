import { useEffect, useRef } from 'react';

import BlogCommentField from './blog-comment-field.component';
import NoDataMessage from './blog-nodata.component';
import AnimationWrapper from './page-animation.component';
import BlogCommentCard from './blog-comment-card.component';

import useTargetBlogStore from '../states/target-blog.state';
import useBlogCommentStore from '../states/blog-comment.state';

import { FlatIcons } from '../icons/flaticons';

import type { BlogStructureType } from '../commons/types.common';
import useCommentFetch from '../fetchs/comment.fetch';

const BlogCommentContainer = () => {
  const commentContainerRef = useRef<HTMLDivElement | null>(null);
  const commentsDivRef = useRef<HTMLDivElement>(null);

  const { targetBlogInfo, setTargetBlogInfo } = useTargetBlogStore();
  const {
    commentsWrapper,
    isCommented,
    totalParentCommentsLoaded,
    modalRefStore,
    setCommentsWrapper,
    setTotalParentCommentsLoaded,
  } = useBlogCommentStore();

  const {
    title,
    activity: { total_parent_comments },
    comments: { results: commentArr },
  } = targetBlogInfo as Required<BlogStructureType>;

  const { GetAndGenerateCommentsData } = useCommentFetch();

  // 關閉留言區塊
  const handleCloseCommentContainer = () => {
    setCommentsWrapper(false);
  };

  // 載入更多留言
  const handleLoadmoreComments = async () => {
    // 取得新的留言(skip 掉原本就 load 的 comments 數量)
    const newCommentArr = await GetAndGenerateCommentsData({
      skip: totalParentCommentsLoaded,
      blogObjectId: targetBlogInfo?._id,
      commentArray: commentArr,
    });

    setTargetBlogInfo({
      ...targetBlogInfo,
      comments: newCommentArr,
    });

    setTotalParentCommentsLoaded(newCommentArr.results.length);
  };

  // 當留言時，自動捲動到最底部(最新留言處)
  useEffect(() => {
    if (commentsDivRef.current && isCommented) {
      commentsDivRef.current.scrollTop = commentsDivRef.current.scrollHeight;
    }
  }, [commentArr, isCommented]);

  // 當點擊畫面其他地方時，關閉留言視窗
  useEffect(() => {
    if (commentsWrapper) {
      const containerRef = commentContainerRef.current;
      const modalRef = modalRefStore.current;

      const handleOnBlur = (e: MouseEvent) => {
        // 當 [警告視窗] 不存在，即 modelRef 為 null，
        // 且點擊的地方不是在 [留言視窗] 內，就關閉 [留言視窗]
        if (
          !modalRef &&
          containerRef &&
          !containerRef.contains(e.target as Node)
        ) {
          setCommentsWrapper(false);
        }
      };

      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleOnBlur);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleOnBlur);
      };
    }
  }, [commentsWrapper, commentContainerRef, modalRefStore]);

  return (
    <div
      ref={commentContainerRef}
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
        z-30
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
          ref={commentsDivRef}
          className={`
            max-h-[75%]
            pl-8
            mr-8
            pr-4
            overflow-y-auto
            cstm-scrollbar
          `}
        >
          {commentArr.map((data, i) => (
            <AnimationWrapper
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: commentsWrapper ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <BlogCommentCard
                index={i}
                commentData={data}
                leftVal={data.childrenLevel * 4}
              />
            </AnimationWrapper>
          ))}

          {/* Load more button */}
          {totalParentCommentsLoaded < (total_parent_comments ?? 0) && (
            <button
              onClick={handleLoadmoreComments}
              className="
                flex
                my-3
                center
                text-grey-dark/40
                hover:text-grey-dark/50
                transition
              "
            >
              Load more
            </button>
          )}

          {/* Separate Line */}
          <hr className="mt-8 border-grey-custom" />
        </div>
      ) : (
        <div className="px-8">
          <NoDataMessage message="No comments" />
        </div>
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
