import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import type { OutputData } from "@editorjs/editorjs";

import Loader from "../components/loader.component";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-card-banner.component";
import BlogContent from "../components/blog-content.component";
import HandyToolBtn from "../components/handy-tool.component";
import AnimationWrapper from "../components/page-animation.component";
import BlogCommentContainer from "../components/blog-comment-container.component";
import DeleteCommentWarningModal from "../components/delete-warning.component";
import EditCommentWarningModal from "../components/edit-warning.component";

import useTargetBlogStore from "../states/target-blog.state";
import useCollapseStore from "../states/collapse.state";
import useHomeBlogStore from "../states/home-blog.state";
import useBlogCommentStore from "../states/blog-comment.state";

import useBlogFetch from "../fetchs/blog.fetch";

import { getTimeAgo } from "../commons/date.common";
import type {
  AuthorStructureType,
  BlogStructureType,
} from "../commons/types.common";

const BlogPage = () => {
  const { blogId } = useParams();
  const { searchBarVisibility } = useCollapseStore();
  const { scrollbarVisible } = useHomeBlogStore();
  const {
    commentsWrapper,
    deletedComment,
    totalParentCommentsLoaded,
    initialCommentState,
    setTotalParentCommentsLoaded,
    setTotalRepliesLoaded,
  } = useBlogCommentStore();
  const { targetBlogInfo, similarBlogsInfo, initialBlogInfo } =
    useTargetBlogStore();

  // 因為原本的 BlogStructureType 是可選的，
  // 所以如果要在這裡呼叫所有屬性，typescript 會報錯，因為有可能為 undefined
  // 所以這裡使用 Required<BlogStructureType> 來告訴 typescript 這個物件裡面的所有屬性都是必要的
  // 這樣就不會報錯了
  const { title, content, banner, author, publishedAt } =
    targetBlogInfo as Required<BlogStructureType>;
  const { personal_info } = author as AuthorStructureType;
  const { username: author_username, fullname, profile_img } = personal_info;

  const { isEditWarning } = useBlogCommentStore();

  const { GetTargetBlogInfo } = useBlogFetch();

  const previousBlogIdRef = useRef<string | null>(null);

  // 初始化
  useEffect(() => {
    // 一開始先初始化 totalParentCommentsLoaded 為 null
    // 這裡初始化不能設為 0，因為如果上一篇 Blog 的留言數也是 0 的話，那就不會觸發下面的 useEffect
    // 初始化目的是為了避免切換不同的 BlogId 時，totalParentCommentsLoaded 會保留上一次值的前提下，再加上新的值
    // 這樣會導致 loadmore 功能失常
    setTotalParentCommentsLoaded(null);

    // 與上述一樣，同樣初始化加載的回覆數
    setTotalRepliesLoaded([]);

    // 當切換 BlogId 時，要重新初始化 Blog 資訊與留言
    // 避免看到上一篇 Blog 的資訊與留言
    initialBlogInfo();
    initialCommentState();
  }, [blogId]);

  // 當確定 totalParentCommentsLoaded 已初始化後
  // 再根據 blogId 來取得對應的 Blog 資訊與留言
  useEffect(() => {
    if (totalParentCommentsLoaded === null) {
      // 爲了避免 useEffect 的特性(會運行兩次)，而導致 total_reads 會被加兩次
      // 所以這裏利用 useRef 來記錄上一次的 blogId
      // 儅因爲 useEffect 特性而導致的第二次運行時，判斷 blogId 是否等於上一次的 blogId
      // 如果等於，就不會再次呼叫 GetTargetBlogInfo
      if (blogId && blogId !== previousBlogIdRef.current) {
        GetTargetBlogInfo({ blogId });

        previousBlogIdRef.current = blogId;
      }
    }
  }, [totalParentCommentsLoaded]);

  return (
    <AnimationWrapper
      key="BlogPage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!publishedAt ? (
        <Loader className={{ container: "mt-5" }} />
      ) : (
        <>
          {/* Delete comment warning */}
          {deletedComment.state && deletedComment.comment && (
            <DeleteCommentWarningModal
              index={deletedComment.index}
              data={deletedComment.comment}
            />
          )}

          {/* Close edit mode warning */}
          {isEditWarning && <EditCommentWarningModal />}

          {/* Comment Container */}
          <BlogCommentContainer />

          {/* Blog */}
          <div
            className={`
              max-w-[900px]
              mx-auto
              py-10
              max-lg:px-[5vw]
              ${
                searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""
              }
            `}
          >
            {/* Banner */}
            <img src={banner} className="aspect-video" />

            {/* Title && Author */}
            <div className="mt-12">
              {/* Title */}
              <h2>{title}</h2>

              {/* Author && Blog */}
              <div
                // max-sm:flex-col: 指在 max-sm 的螢幕大小以下，即 640px 以下，
                className="
                  flex
                  max-sm:flex-col
                  justify-between
                  my-8
                "
              >
                {/*  Profile image && Fullname && Username */}
                <div
                  className="
                    flex 
                    gap-5 
                    items-start
                  "
                >
                  {/* profile image */}
                  <Link to={`/user/${author_username}`}>
                    <img
                      src={profile_img}
                      className="
                        w-12
                        h-12
                        rounded-full
                        shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
                      shadow-grey-dark/10
                      hover:shadow-grey-dark/20
                        hover:opacity-80
                        transition
                      "
                    />
                  </Link>

                  {/* fullname && username */}
                  <p className="capitalize">
                    {fullname}

                    <br />

                    <Link
                      to={`/user/${author_username}`}
                      className="text-blue-500 hover:underline transition"
                    >
                      @{author_username}
                    </Link>
                  </p>
                </div>

                {/* Blog publish date */}
                <p
                  className="
                    text-grey-dark/60
                    max-sm:mt-6
                    max-sm:ml-12
                    max-sm:pl-5
                  "
                >
                  Published on {getTimeAgo(publishedAt!)}
                </p>
              </div>

              {/* Blog interaction - top */}
              <BlogInteraction />

              {/* Blog Content */}
              <div
                className="
                  my-12
                  blog-page-content
                "
              >
                {Object.entries(content).length
                  ? (content as unknown as { 0: OutputData })[0].blocks.map(
                      (block, i) => {
                        return (
                          <div
                            key={i}
                            className="
                              my-4
                              md:my-8
                            "
                          >
                            <BlogContent block={block} />
                          </div>
                        );
                      }
                    )
                  : ""}
              </div>

              {/* Blog interaction - bottom */}
              <BlogInteraction />

              {/* Similar Blogs */}
              {similarBlogsInfo !== null && similarBlogsInfo.length ? (
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                  "
                >
                  {/* Title */}
                  <h1
                    className="
                      mt-14
                      pb-4
                      text-2xl
                      font-semibold
                      border-b
                      border-grey-custom
                    "
                  >
                    Similar Blogs
                  </h1>

                  {/* Similar blog card */}
                  <div
                    className="
                      grid
                      max-sm:grid-cols-1
                      sm:grid-cols-2
                      sm:gap-10
                    "
                  >
                    {similarBlogsInfo.map((blog, i) => {
                      const { author } = blog as Required<BlogStructureType>;
                      const { personal_info } = author as AuthorStructureType;

                      return (
                        <AnimationWrapper
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                          <BlogPostCard
                            content={blog}
                            author={personal_info}
                            position="vertical"
                          />
                        </AnimationWrapper>
                      );
                    })}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            {/* Floating Button */}
            {scrollbarVisible.visible && (
              <HandyToolBtn
                name="BackToTopAndBottom"
                type="IconBtn"
                iconBtnContainer={{
                  position: `${commentsWrapper ? "left" : ""}`,
                }}
              />
            )}
          </div>
        </>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
