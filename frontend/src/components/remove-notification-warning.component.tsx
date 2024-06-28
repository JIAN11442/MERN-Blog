import { useEffect, useRef } from "react";
import { FlatIcons } from "../icons/flaticons";

import NotificationCard from "./notification-card.component";

import useDashboardStore from "../states/dashboard.state";
import useDashboardFetch from "../fetchs/dashboard.fetch";

import {
  GenerateAuthDataType,
  GenerateToLoadStructureType,
  NotificationStructureType,
} from "../commons/types.common";
import useAuthStore from "../states/user-auth.state";

const RemoveNotificationWarningModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    activeRemoveWarningModal,
    notificationsInfo,
    setActiveRemoveWarningModal,
    setNotificationsInfo,
  } = useDashboardStore();
  const { data, index } = activeRemoveWarningModal;
  const { results, totalDocs: totalNums } =
    notificationsInfo as GenerateToLoadStructureType;

  const { authUser, setAuthUser } = useAuthStore();
  const { notification } = authUser ?? {};
  const { totalCount, countByType } = notification ?? {};

  const { UpdateNotificationRemoveState } = useDashboardFetch();

  // 取消移除
  const handleCancel = () => {
    setActiveRemoveWarningModal({ state: false, index: 0, data: null });
  };

  // 移除
  const handleRemoveNotification = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;

    target.disabled = true;

    // 更新 DB 的資料
    UpdateNotificationRemoveState({ notificationId: data?._id });

    // 更新 zustand 的資料
    results?.splice(index, 1);

    setNotificationsInfo({
      ...notificationsInfo,
      results,
      totalDocs: totalNums - 1,
    } as GenerateToLoadStructureType);

    // 更新 authUser 中 notification 的資料
    const newAuthUser = {
      ...authUser,
      notification: {
        ...notification,
        totalCount: (totalCount ?? 0) - 1,
        countByType: countByType?.map((t) => {
          if (t.type === data?.type) {
            return { ...t, count: t.count - 1 };
          } else {
            return t;
          }
        }),
      },
    } as GenerateAuthDataType;

    console.log(newAuthUser);

    setAuthUser(newAuthUser);

    target.disabled = false;

    // 關閉警告視窗
    handleCancel();
  };

  // 自動關閉刪除警告視窗
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
          max-sm:w-[450px]
          sm:min-w-[500px]
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
            Do you really want to remove this notification ?
          </p>
        </div>

        {/* Preview */}
        <div>
          <NotificationCard
            index={1}
            state="warning"
            data={data as NotificationStructureType}
          />
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
            onClick={(e) => handleRemoveNotification(e)}
            className="
              btn-dark
              px-10
              bg-red-500/80
              rounded-md
            "
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveNotificationWarningModal;
