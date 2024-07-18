import Loader from "./loader.component";
import NoDataMessage from "./blog-nodata.component";
import LoadOptions from "./load-options.component";
import BlogPostCard from "./blog-card-banner.component";
import AnimationWrapper from "./page-animation.component";
import ManagePublishedBlogCard from "./manage-published-blog-card.component";
import ManageDraftBlogCard from "./manage-draft-blogs-card.component";
import MinimalBlogPostCard from "./blog-card-nobanner.component";

import {
  AuthorStructureType,
  BlogStructureType,
  GenerateToLoadStructureType,
  LoadFunctionPropsType,
} from "../commons/types.common";

interface BlogCardListProps {
  id: string;
  data: GenerateToLoadStructureType;
  noDataMessage: string;
  for_type?: "published" | "drafts" | "no-banner" | "banner" | "";
  loadLimit: number;
  loadFunction: (props: LoadFunctionPropsType) => void;
  className?: string;
}

const BlogCardList: React.FC<BlogCardListProps> = ({
  id,
  data,
  noDataMessage,
  for_type = "",
  loadLimit,
  loadFunction,
  className,
}) => {
  const state = for_type.toLowerCase();

  return (
    <>
      {/* Blog Card List */}
      <>
        {data === null ? (
          <Loader />
        ) : data && "results" in data && data.results && data.results.length ? (
          <>
            {data.results.map((blog: BlogStructureType, i) => {
              const { author } = blog ?? {};
              const { personal_info } = (author as AuthorStructureType) ?? {};

              return (
                <AnimationWrapper
                  key={blog.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {!state || state === "banner" ? (
                    <BlogPostCard author={personal_info} content={blog} />
                  ) : state === "no-banner" ? (
                    <MinimalBlogPostCard index={i} blog={blog} />
                  ) : state === "published" ? (
                    <ManagePublishedBlogCard
                      index={i}
                      blog={blog as BlogStructureType}
                    />
                  ) : (
                    <ManageDraftBlogCard
                      index={i}
                      blog={blog as BlogStructureType}
                    />
                  )}
                </AnimationWrapper>
              );
            })}
          </>
        ) : (
          <NoDataMessage message={noDataMessage} />
        )}
      </>

      {/* Load Options */}
      <>
        {data !== null && (
          <LoadOptions
            id={id}
            data={data}
            loadLimit={loadLimit}
            loadFunction={loadFunction}
            className={className}
          />
        )}
      </>
    </>
  );
};

export default BlogCardList;
