import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import BlogStats from "./blog-stats.component";
import AnimationWrapper from "./page-animation.component";

import useDashboardStore from "../states/dashboard.state";

import {
  ActivityStructureType,
  BlogStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";

interface ManagePublishedBlogCardProps {
  index?: number;
  blog: BlogStructureType;
  for_warning?: boolean;
}

const ManagePublishedBlogCard: React.FC<ManagePublishedBlogCardProps> = ({
  index = 0,
  blog,
  for_warning = false,
}) => {
  const { blog_id, banner, title, activity, publishedAt } = blog;

  const deleteBtnRef = useRef<HTMLButtonElement>(null);
  const [activeStats, setActiveStats] = useState(false);

  const { activeDeletePblogWarningModal, setActiveDeletePblogWarningModal } =
    useDashboardStore();

  // 控制 Stats 的顯示與隱藏
  const handleActiveStats = () => {
    setActiveStats(!activeStats);
  };

  // 控制 Warning Modal 的顯示與隱藏
  const handleActiveDeleteWarningModal = () => {
    setActiveDeletePblogWarningModal({
      ...activeDeletePblogWarningModal,
      state: true,
      data: blog,
      deleteBtnRef,
      index,
    });
  };

  return (
    <>
      {/* Blog card */}
      <div
        className={`
          flex
          gap-10
          py-6
          ${index === 0 && !for_warning ? "pt-0" : ""}
          max-md:px-4
          border-b
          border-grey-custom
          items-center
          ${
            for_warning &&
            `
              px-4
              gap-5
              border
              rounded-md
              shadow-[0px_0px_5px_1px]
              shadow-grey-custom
            `
          }
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
          <>
            {!for_warning && (
              <div
                className="
                  flex
                  py-2
                  gap-5
                  mt-3
                "
              >
                {/* Edit */}
                <Link
                  to={`/editor/${blog_id}`}
                  className="
                    hover:text-purple-custom
                    hover:underline
                    transition
                  "
                >
                  Edit
                </Link>

                {/* Stats */}
                <button
                  onClick={handleActiveStats}
                  className={`
                    lg:hidden
                    hover:text-purple-custom
                    hover:underline
                    transition
                    ${
                      activeStats &&
                      `
                        font-medium
                        underline
                        text-purple-custom
                      `
                    }
                  `}
                >
                  Stats
                </button>

                {/* Delete */}
                <button
                  ref={deleteBtnRef}
                  onClick={handleActiveDeleteWarningModal}
                  className="
                    text-red-400
                    hover:text-red-500
                    hover:underline
                    transition
                  "
                >
                  Delete
                </button>
              </div>
            )}
          </>
        </div>

        {/* Blog Stats - lg screen */}
        <>
          {!for_warning && (
            <div
              className="
                xl:ml-10
                -mt-7
                max-lg:hidden
              "
            >
              <BlogStats stats={activity as ActivityStructureType} />
            </div>
          )}
        </>
      </div>

      {/* Blog Stats - max-lg screen */}
      <>
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
    </>
  );
};

export default ManagePublishedBlogCard;
