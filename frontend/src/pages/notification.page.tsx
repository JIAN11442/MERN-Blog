import { useEffect, useRef, useState } from "react";
import { FlatIcons } from "../icons/flaticons";

import useAuthStore from "../states/user-auth.state";
import useDashboardStore from "../states/dashboard.state";

import NoDataMessage from "../components/blog-nodata.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../components/page-animation.component";
import NotificationCard from "../components/notification-card.component";
import LoadOptions from "../components/load-options.components";
import RemoveNotificationWarningModal from "../components/remove-notification-warning.component";
import DeleteNotificationCommentWarningModal from "../components/delete-notification-comment-warning.component";

import useDashboardFetch from "../fetchs/dashboard.fetch";

import { NotificationStructureType } from "../commons/types.common";

const NotificationPage = () => {
  const filters = ["all", "like", "comment", "reply"];

  const filterPanelRef = useRef<HTMLDivElement>(null);

  const [collapse, setCollapse] = useState(false);
  const [panelActive, setPanelActive] = useState(false);
  const [windowInnerWidth, setWindowInnerWidth] = useState(window.innerWidth);

  const { authUser } = useAuthStore();
  const { notification } = authUser ?? {};

  const {
    filter,
    notificationsInfo,
    activeRemoveWarningModal,
    activeDeleteWarningModal,
    isDeleteReply,
    setFilter,
    setNotificationsInfo,
    setIsDeleteReply,
  } = useDashboardStore();

  const { GetNotificationByFilter, GetNotificationsByUserId } =
    useDashboardFetch();

  // 通過點擊 button 來改變 filter 的狀態
  const handleFilterState = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const innerText = target.innerText.toLowerCase().split(" ")[0];
    const stateCount =
      notification?.countByType.find((t) => t.type === innerText)?.count ?? 0;

    setFilter({ ...filter, type: innerText, count: stateCount });

    // 更新通知數
    GetNotificationsByUserId();
  };

  // 決定 filterPanel 的開關狀態
  const handlePanelState = () => {
    setPanelActive(!panelActive);
  };

  // 當 filterPanel 是 active 時，
  // 監聽點擊事件，當點擊的不是 filterPanel 時，就關閉 filterPanel
  // 實現自動關閉 filterPanel 的效果
  useEffect(() => {
    if (panelActive && filterPanelRef.current) {
      const panelOnBlur = (e: MouseEvent) => {
        if (!filterPanelRef.current?.contains(e.target as Node)) {
          setPanelActive(false);
        }
      };

      const timeout = setTimeout(() => {
        document.addEventListener("click", panelOnBlur);
      }, 0);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener("click", panelOnBlur);
      };
    }
  }, [panelActive, filterPanelRef]);

  // 監聽遊覽器寬度，
  // 以便知道什麼時候要 collapse filter
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 400) {
        setCollapse(true);
      } else {
        setCollapse(false);
      }

      setWindowInnerWidth(window.innerWidth);
    };

    // 第一次進入頁面時，先執行一次 handleResize
    // 而不是等到 resize 時才執行
    handleResize();

    // 更新通知數
    GetNotificationsByUserId();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 儅 filter 改變時，重新取得相關通知資料
  useEffect(() => {
    setNotificationsInfo(null);

    // 如果是因爲刪除通知的回覆訊息而觸發
    // 那需要延遲一秒後再重新取得通知資料
    if (isDeleteReply) {
      const timeout = setTimeout(() => {
        // 更新通知數
        GetNotificationsByUserId();

        GetNotificationByFilter({
          page: 1,
          filter: filter.type,
          deleteDocCount: 0,
        });
      }, 1000);

      return () => {
        clearTimeout(timeout);
        setIsDeleteReply(false);
      };
    }
    // 反之如果是因爲點擊 filter 按鈕而觸發
    // 那不需要延遲，直接重新取得通知資料
    else {
      GetNotificationByFilter({
        page: 1,
        filter: filter.type,
        deleteDocCount: 0,
      });
    }
  }, [filter, isDeleteReply]);

  // 初始化 filter 的 count
  // 為了在遊覽器小於 400px 時，能正確的顯示 'all' filter 的 count
  useEffect(() => {
    if (notification?.totalCount) {
      setFilter({ ...filter, count: notification.totalCount });
    }
  }, [notification]);

  return (
    <div>
      {/* Warning Modal */}
      {activeRemoveWarningModal.state && <RemoveNotificationWarningModal />}
      {activeDeleteWarningModal.state && (
        <DeleteNotificationCommentWarningModal />
      )}

      {/* Title */}
      <h1
        className="
          max-md:hidden
          text-xl
          font-medium
          truncate
        "
      >
        Recent Notifications
      </h1>

      {/* Filters Options */}
      <div className="my-8 max-md:mt-0">
        {!collapse ? (
          // 當遊覽器寬度大於 400px
          <div
            className="
              flex
              gap-6
              max-sm:gap-3
              transition
            "
          >
            {filters.map((item, i) => {
              // 找到目標 type 的資料
              const targetTypeInfo = notification?.countByType.find(
                (t) => t.type === item
              );

              return (
                <div key={i} className="relative">
                  {/* Filter button */}
                  <button
                    onClick={(e) => handleFilterState(e)}
                    className={`
                      py-2
                      truncate
                      ${filter.type === item ? "btn-dark" : "btn-light"}
                    `}
                  >
                    {item === "all"
                      ? `${item} (${notification?.totalCount ?? 0})`
                      : item}
                  </button>

                  {/* Notification number of type */}
                  {targetTypeInfo?.count ? (
                    <span
                      className="
                        absolute
                        -top-2
                        -right-1
                        w-5
                        h-5
                        bg-red-500
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-[11px]
                        text-white-custom
                      "
                    >
                      {targetTypeInfo.count}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // 當遊覽器寬度小於 400px
          <div>
            {/* Filter state button */}
            <button
              onClick={handlePanelState}
              className="
                flex
                gap-3
                items-center
                justify-center
                btn-light
             "
            >
              {/* Filter Icon */}
              <FlatIcons name="fi fi-rr-settings-sliders" className="text-sm" />
              <p>
                {filter.type + `${filter.count ? ` (${filter.count})` : ""}`}
              </p>
            </button>

            {/* Filter options panel */}
            <div
              ref={filterPanelRef}
              className={`
                grid
                p-6
                gap-2
                ${
                  panelActive
                    ? `
                        block
                        border-b
                        border-grey-custom
                      `
                    : "hidden"
                }
                ${windowInnerWidth > 300 ? "grid-cols-2" : "grid-cols-1"}
              `}
            >
              {filters.map((item, i) => {
                const targetTypeInfo = notification?.countByType.find(
                  (t) => t.type === item
                );

                return (
                  <div
                    key={i}
                    className="
                      flex
                      gap-2
                      items-center
                      justify-start
                    "
                  >
                    <input
                      type="radio"
                      name={item}
                      checked={item === filter.type}
                      className="w-5 h-5"
                      onChange={() => {
                        setFilter({
                          ...filter,
                          type: item,
                          count:
                            item === "all"
                              ? notification?.totalCount ?? 0
                              : targetTypeInfo?.count ?? 0,
                        });
                        setPanelActive(false);
                      }}
                    />
                    <p>{item}</p>

                    {/* 目標 type 通知數 */}
                    {targetTypeInfo?.count ? (
                      <span>({targetTypeInfo.count})</span>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notification Contents */}
      <>
        {notificationsInfo === null ? (
          <Loader />
        ) : (
          <>
            {"results" in notificationsInfo &&
            notificationsInfo?.results?.length ? (
              <>
                {notificationsInfo.results.map(
                  (item: NotificationStructureType, i) => (
                    <AnimationWrapper
                      key={i}
                      keyValue="notification-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <NotificationCard index={i} data={item} />
                    </AnimationWrapper>
                  )
                )}

                <LoadOptions
                  id="notification-page"
                  data={notificationsInfo}
                  loadLimit={import.meta.env.VITE_NOTIFICATIONS_LIMIT}
                  loadFunction={GetNotificationByFilter}
                  filter={filter.type}
                />
              </>
            ) : (
              <NoDataMessage message="Nothing available" />
            )}
          </>
        )}
      </>
    </div>
  );
};

export default NotificationPage;
