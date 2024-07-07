import { Link } from "react-router-dom";
import {
  ActivityStructureType,
  BlogStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";
import { useState } from "react";
import BlogStats from "./blog-stats.component";
import AnimationWrapper from "./page-animation.component";

interface ManagePublishedBlogCardProps {
  blog: BlogStructureType;
}

const ManagePublishedBlogCard: React.FC<ManagePublishedBlogCardProps> = ({
  blog,
}) => {
  const { blog_id, banner, title, activity, publishedAt } = blog;

  const [activeStats, setActiveStats] = useState(false);

  const handleActiveStats = () => {
    setActiveStats(!activeStats);
  };

  return (
    <>
      {/* Blog card */}
      <div
        className={`
          flex
          gap-10
          py-6
          max-md:px-4
          border-b
          border-grey-custom
          items-center
        `}
      >
        {/* Banner */}
        <img
          src={banner}
          className="
            w-28
            h-28
            flex-none

            bg-grey-custom
            object-cover
            rounded-md
          "
        />

        {/* Content && Options */}
        <div
          className="
            flex
            flex-col
            w-full
            py-2
            min-w-[200px]
            justify-between
          "
        >
          {/* Title && Published date */}
          <div>
            {/* Title */}
            <Link
              to={`/blog/${blog_id}`}
              className="
                mb-4
                blog-title
                hover:underline
              "
            >
              {title}
            </Link>

            {/* Published date */}
            <p
              className="
                text-grey-dark/50
                line-clamp-1
              "
            >
              Published on {getTimeAgo(publishedAt as string)}
            </p>
          </div>

          {/* Options */}
          <div
            className="
              flex
              py-2
              gap-6
              mt-3
            "
          >
            {/* Edit */}
            <Link
              to={`/editor/${blog_id}`}
              className="
                underline
                hover:text-purple-custom
                transition
              "
            >
              Edit
            </Link>

            {/* Stats */}
            <button
              onClick={handleActiveStats}
              className="
                lg:hidden
                underline
                hover:text-purple-custom
                transition
              "
            >
              Stats
            </button>

            {/* Delete */}
            <button
              className="
                underline
                text-red-400
                hover:text-red-500
                transition
              "
            >
              Delete
            </button>
          </div>
        </div>

        {/* Blog Stats */}
        <div
          className="
            xl:ml-10
            -mt-10
            max-lg:hidden
          "
        >
          <BlogStats stats={activity as ActivityStructureType} />
        </div>
      </div>

      {/* Blog Stats */}
      {activeStats && (
        <AnimationWrapper
          key={`blog-stats-${blog_id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="
            lg:hidden
            -mb-6
          "
        >
          <BlogStats stats={activity as ActivityStructureType} />
        </AnimationWrapper>
      )}
    </>
  );
};

export default ManagePublishedBlogCard;
