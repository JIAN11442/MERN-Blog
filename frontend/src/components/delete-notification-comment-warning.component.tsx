import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FlatIcons } from "../icons/flaticons";

import useAuthStore from "../states/user-auth.state";
import useDashboardStore from "../states/dashboard.state";

import useCommentFetch from "../fetchs/comment.fetch";

import {
  AuthorStructureType,
  GenerateCommentStructureType,
  GenerateToLoadStructureType,
  NotificationStructureType,
} from "../commons/types.common";

const DeleteNotificationCommentWarningModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);

  const { authUser } = useAuthStore();
  const {
    notificationsInfo,
    activeDeleteNtfWarningModal,
    setNotificationsInfo,
    setActiveDeleteNtfWarningModal,
    setIsDeleteReply,
  } = useDashboardStore();
  const { index, data } = activeDeleteNtfWarningModal;
  const { reply } = data as NotificationStructureType;
  const { _id, comment, children } = reply as GenerateCommentStructureType;

  const { results } = notificationsInfo as GenerateToLoadStructureType;
  const { user } = (results as NotificationStructureType[])[index];
  const { username } = (user as AuthorStructureType).personal_info;

  const { DeleteTargetComment } = useCommentFetch();

  // 取消刪除
  const handleCancel = () => {
    setActiveDeleteNtfWarningModal({ state: false, index: 0, data: null });
  };

  // 刪除
  const handleDeleteComment = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;

    target.disabled = true;

    if (results) {
      // 刪除數據庫中的留言
      DeleteTargetComment({
        commentObjId: _id,
        notificationObjId: (results[index] as NotificationStructureType)._id,
      });

      // 更新 zustand 中 reply 資料
      (results[index] as NotificationStructureType).reply = "";

      setNotificationsInfo({
        ...(notificationsInfo as GenerateToLoadStructureType),
        results,
      });
    }

    target.disabled = false;

    // 觸發 notification.page 重新 fetch 數據
    setIsDeleteReply(true);

    // 關閉 modal
    handleCancel();
  };

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
      clearTimeout(timeout);
      document.removeEventListener("click", handleOnBlur);
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
          max-sm:w-[400px]
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
            <span>Do you really want to delete this reply </span>

            {children && children.length ? (
              <span>and its sub-replies ?</span>
            ) : (
              <span>?</span>
            )}
          </p>
        </div>

        {/* Preview */}
        <div
          className="
            p-4
            bg-grey-custom/70
            rounded-md
          "
        >
          <div
            className="
              flex
              gap-3
              items-center
            "
          >
            <img
              src={authUser?.profile_img}
              className="
                w-9
                h-9
                rounded-full
                shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
              shadow-grey-dark/5
              "
            />

            <h1
              className="
                font-medium
                text-xl
                text-grey-dark
                line-clamp-1
              "
            >
              <Link
                to={`/user/${authUser?.username}`}
                className="
                  text-blue-500
                  hover:underline
                  transition
                  mx-1
                "
              >
                @{authUser?.username}
              </Link>

              <span className="font-normal">replied to</span>

              <Link
                to={`/user/${username}`}
                className="
                  text-blue-500
                  hover:underline
                  transition
                  mx-1
                "
              >
                @{username}
              </Link>
            </h1>
          </div>

          <p
            className="
              my-2
              ml-14
              text-green-600
              line-clamp-1
            "
          >
            {comment}
          </p>
        </div>

        {/* Buttons */}
        <div
          className="
            flex
            mt-2
            items-center
            justify-center
            gap-8
          "
        >
          <button
            onClick={handleCancel}
            className="
              btn-dark
              px-10
              bg-grey-dark/30
              rounded-md
            "
          >
            Cancel
          </button>

          <button
            onClick={(e) => handleDeleteComment(e)}
            className="
              btn-dark
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

export default DeleteNotificationCommentWarningModal;
