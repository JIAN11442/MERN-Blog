import { useEffect, useRef } from "react";
import { FlatIcons } from "../icons/flaticons";

import ManagePublishedBlogCard from "./manage-published-blog-card.component";
import ManageDraftBlogCard from "./manage-draft-blogs-card.component";

import useDashboardStore from "../states/dashboard.state";
import { BlogStructureType } from "../commons/types.common";
import useDashboardFetch from "../fetchs/dashboard.fetch";

interface DeleteBlogWarningModalProps {
  state: string;
}

const DeleteBlogWarningModal: React.FC<DeleteBlogWarningModalProps> = ({
  state,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    activeDeletePblogWarningModal,
    activeDeleteDfblogWarningModal,
    setActiveDeletePblogWarningModal,
    setActiveDeleteDfblogWarningModal,
  } = useDashboardStore();

  const { DeleteTargetBlogById } = useDashboardFetch();

  // 取消
  const handleCancel = () => {
    if (state === "published") {
      setActiveDeletePblogWarningModal({
        ...activeDeletePblogWarningModal,
        state: false,
        index: 0,
        data: null,
      });
    } else {
      setActiveDeleteDfblogWarningModal({
        ...activeDeleteDfblogWarningModal,
        state: false,
        index: 0,
        data: null,
      });
    }
  };

  // 刪除
  const handleDelete = () => {
    const published = activeDeletePblogWarningModal;
    const draft = activeDeleteDfblogWarningModal;

    const blogObjId =
      state === "published" ? published.data?._id : draft.data?._id;

    const deleteBtnRef =
      state === "published"
        ? published.deleteBtnRef?.current
          ? published.deleteBtnRef
          : null
        : draft.deleteBtnRef?.current
        ? draft.deleteBtnRef
        : null;

    DeleteTargetBlogById({ state, blogObjId, deleteBtnRef });
  };

  // 點擊 modal 以外的地方，關閉 modal
  useEffect(() => {
    const handleOnBlur = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleOnBlur);
    }, 0);

    return () => {
      document.removeEventListener("click", handleOnBlur);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="
        fixed
        inset-0
        bg-grey-dark/50
        z-40
      "
    >
      <div
        ref={modalRef}
        className="
          absolute
          max-sm:w-[420px]
          sm:min-w-[450px]
          sm:max-w-[650px]
          p-12
          -translate-x-1/2
          -translate-y-1/2
          top-1/2
          left-1/2
          flex
          flex-col
          gap-5
          bg-white-custom
          rounded-md
          transition
        "
      >
        {/* Warning Icon */}
        <FlatIcons
          name="fi fi-tr-trash-xmark"
          className="
            text-8xl
            text-red-500/50
            center
          "
        />

        {/* Warning Title */}
        <div className="flex flex-col gap-3">
          {/* Warning Title */}
          <h1
            className="
                text-3xl
                font-medium
                font-sans
                text-grey-dark
                center
              "
          >
            Are you Sure?
          </h1>

          {/* Warning Content */}
          <p
            className="
                mt-2
                text-xl
                text-red-custom/80
                line-clamp-2
                center
              "
          >
            <span>Do you really want to delete this {state} blog ? </span>
          </p>
        </div>

        {/* Preview */}
        <div className="py-2">
          {state === "published" ? (
            <ManagePublishedBlogCard
              for_warning={true}
              blog={activeDeletePblogWarningModal.data as BlogStructureType}
            />
          ) : (
            <ManageDraftBlogCard
              blog={activeDeleteDfblogWarningModal.data as BlogStructureType}
              index={activeDeleteDfblogWarningModal.index as number}
              for_warning={true}
            />
          )}
        </div>

        {/* Buttons */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-8
          "
        >
          <button
            onClick={handleCancel}
            className="
              btn-dark
              text-white
              px-10
              bg-grey-dark/30
              rounded-md
            "
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="
              btn-dark
              text-white
              px-10
              bg-red-500/80
              rounded-md
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBlogWarningModal;
