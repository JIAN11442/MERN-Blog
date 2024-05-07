import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import useBlogFetch from "../fetchs/blog.fetch";

import useTargetBlogStore from "../states/target-blog.state";

import type { BlogStructureType } from "../../../backend/src/utils/types.util";
import AnimationWrapper from "../components/page-animation.component";
import Loader from "../components/loader.component";
import { getDay } from "../commons/date.common";
import BlogInteraction from "../components/blog-interaction.component";
import useCollapseStore from "../states/collapse.state";
import BlogPostCard from "../components/blog-card-banner.component";
import BlogContent from "../components/blog-content.component";
import type { OutputData } from "@editorjs/editorjs";

const BlogPage = () => {
  const { blogId } = useParams();
  const { searchBarVisibility } = useCollapseStore();
  const { GetTargetBlogInfo } = useBlogFetch();
  const { targetBlogInfo, initialBlogInfo, similarBlogsInfo } =
    useTargetBlogStore();

  // 因為原本的 BlogStructureType 是可選的，所以如果要在這裡呼叫所有屬性，typescript 會報錯，因為有可能為 undefined
  // 所以這裡使用 Required<BlogStructureType> 來告訴 typescript 這個物件裡面的所有屬性都是必要的
  // 這樣就不會報錯了
  const {
    title,
    content,
    banner,
    author: {
      personal_info: { username: author_username, fullname, profile_img },
    },
    publishedAt,
  } = targetBlogInfo as Required<BlogStructureType>;

  // Fetch target blog info
  useEffect(() => {
    if (blogId) {
      GetTargetBlogInfo(blogId);
    }

    // 當離開這個頁面時，把 targetBlogInfo 重設為初始值
    // 這樣下次進來這個頁面時，就不會看到上次的資料
    return () => {
      initialBlogInfo();
    };
  }, [blogId]);

  useEffect(() => {
    if (Object.entries(content).length) {
      console.log(content);
    }
  }, [content]);

  return (
    <AnimationWrapper
      key="BlogPage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!publishedAt ? (
        <Loader
          loader={{ speed: 1, size: 50 }}
          className={{ container: "mt-5" }}
        />
      ) : (
        <div
          className={`
            max-w-[900px]
            mx-auto
            py-10
            max-lg:px-[5vw]
            ${searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""}
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
                <img src={profile_img} className="w-12 h-12 rounded-full" />

                {/* fullname && username */}
                <p className="capitalize">
                  {fullname}

                  <br />

                  <Link
                    to={`/user/${author_username}`}
                    className="underline underline-offset-2 text-blue-500"
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
                Published on {getDay(publishedAt)}
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
                    max-md:grid-cols-1
                    md:grid-cols-2
                    md:gap-20
                  "
                >
                  {similarBlogsInfo.map((blog, i) => {
                    const {
                      author: { personal_info },
                    } = blog as Required<BlogStructureType>;

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
        </div>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
