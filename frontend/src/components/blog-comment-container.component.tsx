import { useEffect, useRef, useState } from "react";

import BlogCommentField from "./blog-comment-field.component";
import NoDataMessage from "./blog-nodata.component";
import AnimationWrapper from "./page-animation.component";
import BlogCommentCard from "./blog-comment-card.component";

import useTargetBlogStore from "../states/target-blog.state";
import useBlogCommentStore from "../states/blog-comment.state";

import { FlatIcons } from "../icons/flaticons";

import type { BlogStructureType } from "../commons/types.common";
import useCommentFetch from "../fetchs/comment.fetch";

const BlogCommentContainer = () => {
  const commentContainerRef = useRef<HTMLDivElement | null>(null);
  const commentsDivRef = useRef<HTMLDivElement>(null);

  const [paddingLeftIncrementVal, setPaddingLeftIncrementVal] = useState(10);
  const [optionsCollapse, setOptionsCollapse] = useState(false);
  const [allowLoadMoreReplies, setAllowLoadMoreReplies] = useState(true);

  const { targetBlogInfo, setTargetBlogInfo } = useTargetBlogStore();

  const {
    title,
    activity: { total_parent_comments },
    comments: { results: commentsArr },
  } = targetBlogInfo as Required<BlogStructureType>;

  const {
    commentsWrapper,
    isCommented,
    totalParentCommentsLoaded,
    modalStoreRef,
    adjustContainerWidth,
    editComment,
    isEditedComment,
    setCommentsWrapper,
    setTotalParentCommentsLoaded,
    setMaxChildrenLevel,
    setAdjustContainerWidth,
    setEditComment,
    setIsEditWarning,
    setDeleteBtnDisabled,
  } = useBlogCommentStore();

  const { GetAndGenerateCommentsData } = useCommentFetch();

  // 關閉留言區塊
  const handleCloseCommentContainer = () => {
    // 關閉留言視窗
    setCommentsWrapper(false);

    // 最後將刪除按鈕設為可用
    setDeleteBtnDisabled(false);
  };

  // 載入更多留言
  const handleLoadmoreComments = async () => {
    // 取得新的留言(skip 掉原本就 load 的 comments 數量)
    const newCommentsArr = await GetAndGenerateCommentsData({
      skip: totalParentCommentsLoaded ?? 0,
      blogObjectId: targetBlogInfo?._id,
      commentsArr,
    });

    setTargetBlogInfo({
      ...targetBlogInfo,
      comments: newCommentsArr,
    });

    setTotalParentCommentsLoaded(newCommentsArr.results.length);
  };

  // 當留言時，自動捲動到最底部(最新留言處)
  useEffect(() => {
    if (commentsDivRef.current && isCommented) {
      commentsDivRef.current.scrollTop = commentsDivRef.current.scrollHeight;
    }
  }, [commentsArr, isCommented]);

  // 當點擊畫面其他地方時，關閉留言視窗
  useEffect(() => {
    if (commentsWrapper) {
      const containerRef = commentContainerRef.current;
      const modalRef = modalStoreRef.current;

      const handleOnBlur = (e: MouseEvent) => {
        // 當 [警告視窗] 不存在，即 modelRef 為 null，
        // 且點擊的地方不是在 [留言視窗] 內，就關閉 [留言視窗]
        if (
          !modalRef &&
          containerRef &&
          !containerRef.contains(e.target as Node)
        ) {
          // 如果已編輯，即編輯框内容與原留言不同，
          // 就顯示警告視窗
          // 之後是否關閉留言視窗，就看警告視窗的選項
          if (isEditedComment) {
            setIsEditWarning(true);
          }
          // 反之，就是正常關閉留言視窗
          else {
            // 關閉留言視窗
            setCommentsWrapper(false);

            // 初始化編輯留言記錄
            setEditComment({ status: false, data: null });

            // 最後將刪除按鈕設為可用
            setDeleteBtnDisabled(false);
          }
        }
      };

      const timeout = setTimeout(() => {
        document.addEventListener("click", handleOnBlur);
      }, 0);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener("click", handleOnBlur);
      };
    }
  }, [commentsWrapper, commentContainerRef, modalStoreRef, isEditedComment]);

  // 計算最大子留言層數
  useEffect(() => {
    if (commentsArr) {
      const maxLevel = commentsArr.reduce(
        (acc, comment) =>
          comment.childrenLevel > acc ? comment.childrenLevel : acc,
        0
      );

      setMaxChildrenLevel(maxLevel);
    }
  }, [targetBlogInfo, commentsArr]);

  // 調整留言版面寬度
  useEffect(() => {
    // 如果有 comment card 小於能接受的最小寬度，即 adjustWidth 為 true
    if (adjustContainerWidth.adjustWidth) {
      // 取得當前留言版面的寬度
      const containerWidth = commentContainerRef.current?.offsetWidth;

      // 在原有的寬度上增加 incrementVal
      // 就是要調整的新寬度
      const resizeWidth =
        (containerWidth ?? 0) + adjustContainerWidth.incrementVal;

      if (commentContainerRef.current) {
        // 如果當前留言版面寬度大於等於 640px，即 tailwindcss 中的 sm
        // 且新增的寬度是小於游覽器寬度的，那就調整留言版面寬度
        if (window.innerWidth >= 640 && resizeWidth < window.innerWidth) {
          // console.log(`sm: ${containerWidth} 調整為 ${resizeWidth} `);

          commentContainerRef.current.style.width = `${resizeWidth}px`;
        }
        // 反之，如果當前留言版面寬度小於 640px，即 tailwindcss 中的 max:sm
        // 或是新增的寬度大於游覽器寬度，
        else {
          // 直接將寬度調整為 100%
          commentContainerRef.current.style.width = `100%`;

          // 那就看 paddingLeftIncrementVal 還有沒有空間可以縮小
          // 如果有，那就利用 paddingLeftIncrementVal 來調整 padding-left
          // 來達到另類的擴展留言版面的效果
          if (paddingLeftIncrementVal - 1 > 1) {
            const newIncrementVal = paddingLeftIncrementVal - 1;

            // console.log(
            //   `max-sm: ${paddingLeftIncrementVal} 調整為 ${newIncrementVal}`
            // );

            setPaddingLeftIncrementVal(newIncrementVal);
          }
          // 如果 paddingLeftIncrementVal 已經達到最小值，
          // 且當前留言版面寬度大於 140px
          // 那就調整 icon 顯示方式來達到另類的擴展留言版面的效果
          else {
            if (adjustContainerWidth.commentCardWidth > 140) {
              // console.log(
              //   `padding-left 已達最小值，轉而調整 icon 顯示方式，當前留言卡寬度為 ${adjustContainerWidth.commentCardWidth}`
              // );

              setOptionsCollapse(true);
            }
            // 如果當前留言版面寬度小於 140px，那就强制暫停載入，
            // 直到游覽器寬度增加，進而觸發下面的 useEffect 監聽
            else {
              // console.log(`應强制暫停載入，除非自行增加游覽器寬度`);

              setAllowLoadMoreReplies(false);
            }
          }
        }

        setAdjustContainerWidth({
          ...adjustContainerWidth,
          adjustWidth: false,
        });
      }
    }
  }, [adjustContainerWidth]);

  // 這是爲了 max:sm 經過調整留言版面、留言退縮距離、操作圖標化這三步后
  // 還是無法容納留言卡時，就强制暫停載入
  // 直到游覽器寬度增加，才能繼續載入
  useEffect(() => {
    let previousWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth > previousWidth) {
        // console.log("游覽器寬度增加，允許載入更多留言");
        setAllowLoadMoreReplies(true);
      }
      previousWidth = currentWidth;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={commentContainerRef}
      className={`
        fixed
        w-[50%]
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

      {/* Comments */}
      <>
        {commentsArr.length ? (
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
            {commentsArr.map((comment, i) => (
              <AnimationWrapper
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: commentsWrapper ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <BlogCommentCard
                  index={i}
                  commentData={comment}
                  leftVal={comment.childrenLevel * 4}
                  paddingLeftIncrementVal={paddingLeftIncrementVal}
                  optionsCollapse={optionsCollapse}
                  allowLoadMoreReplies={allowLoadMoreReplies}
                />
              </AnimationWrapper>
            ))}

            {/* Load more button */}
            {totalParentCommentsLoaded &&
              totalParentCommentsLoaded < (total_parent_comments ?? 0) && (
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
            <NoDataMessage message="No comments yet" />
          </div>
        )}
      </>

      {/* Comment Field */}
      <div
        className={`
          absolute
          ${
            editComment.status
              ? `
                  top-0
                  w-full
                  h-full
                  bg-black-custom/20
                `
              : `
                  bottom-5
                  w-full
                  px-8
                `
          }
        `}
      >
        {editComment.status ? (
          <div
            className="
              absolute
              bottom-0
              w-full
              px-8
              pb-7
              pt-5
              bg-white-custom
            "
          >
            <BlogCommentField action="edit" showButton={true} />
          </div>
        ) : (
          <BlogCommentField action="comment" />
        )}
      </div>
    </div>
  );
};

export default BlogCommentContainer;
