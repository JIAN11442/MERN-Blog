import { Link } from "react-router-dom";
import { BlogStructureType } from "../commons/types.common";
import useDashboardStore from "../states/dashboard.state";
import { useRef } from "react";

interface ManageDraftBlogCardProps {
  index: number;
  blog: BlogStructureType;
  for_warning?: boolean;
}

const ManageDraftBlogCard: React.FC<ManageDraftBlogCardProps> = ({
  index,
  blog,
  for_warning = false,
}) => {
  const newIndex = index + 1;
  const { title, des, blog_id } = blog;

  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  const { activeDeleteDfblogWarningModal, setActiveDeleteDfblogWarningModal } =
    useDashboardStore();

  const handleActiveDeleteWarningModal = () => {
    setActiveDeleteDfblogWarningModal({
      ...activeDeleteDfblogWarningModal,
      state: true,
      index,
      data: blog,
      deleteBtnRef,
    });
  };

  return (
    <div
      className={`
        flex
        gap-10
        py-6
        ${index === 0 && !for_warning ? "pt-0" : ""}
        max-md:px-4
        border-b
        border-grey-custom
        ${
          for_warning &&
          `
            pr-4
            gap-5
            border
            rounded-md
            shadow-[0px_0px_5px_1px]
            shadow-grey-custom
          `
        }
      `}
    >
      {/* Index */}
      <h1
        className="
          blog-index
          text-center
          pl-4
          md:pl-6
          flex-none
        "
      >
        {newIndex < 10 ? `0${newIndex}` : newIndex}
      </h1>

      {/* Content && Options*/}
      <div
        className="
          flex
          flex-col
          gap-3
        "
      >
        {/* Title */}
        <h1 className="blog-title">{title}</h1>

        {/* Description */}
        <p
          className={`
            text-[17px]
            font-gelasio
            leading-8
            line-clamp-2
            transition
            ${des?.length ? "" : "text-grey-dark/40"}
          `}
        >
          {des?.length ? des : "No Description"}
        </p>

        {/* Options */}
        <>
          {!for_warning && (
            <div
              className="
                flex
                gap-5
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
    </div>
  );
};

export default ManageDraftBlogCard;
