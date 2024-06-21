import { useEffect, useRef, useState } from "react";
import { FlatIcons } from "../icons/flaticons";
import useAuthStore from "../states/user-auth.state";

const NotificationPage = () => {
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState("all");
  const [collapse, setCollapse] = useState(false);
  const [panelActive, setPanelActive] = useState(false);
  const [windowInnerWidth, setWindowInnerWidth] = useState(window.innerWidth);

  const filters = ["all", "like", "comment", "reply"];

  const { authUser } = useAuthStore();
  const { notification } = authUser ?? {};

  // 通過點擊 button 來改變 filter 的狀態
  const handleFilterState = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;

    setFilter(target.innerText.toLowerCase());
  };

  // 決定 filterPanel 的開關狀態
  const handlePanelState = () => {
    setPanelActive(!panelActive);
  };

  // 監聽遊覽器寬度，
  // 以便知道什麼時候要 collapse filter
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 400) {
        setCollapse(true);
      } else {
        setCollapse(false);
        // setPanelActive(false);
      }

      setWindowInnerWidth(window.innerWidth);
    };

    // 第一次進入頁面時，先執行一次 handleResize
    // 而不是等到 resize 時才執行
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  return (
    <div>
      {/* Title */}
      <h1
        className="
          max-md:hidden
          text-xl
          font-medium
          truncate
          mb-8  
        "
      >
        Recent Notifications
      </h1>

      {/* Filters Options */}
      <>
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
                      ${filter === item ? "btn-dark" : "btn-light"}
                    `}
                  >
                    {item}
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
                        z-10
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
                gap-2
                items-center
                justify-center
                btn-light
             "
            >
              {/* Filter Icon */}
              <FlatIcons name="fi fi-rr-settings-sliders" className="text-sm" />
              <p>{filter}</p>
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
              {filters.map((item, i) => (
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
                    checked={item === filter}
                    className="w-5 h-5"
                    onChange={() => {
                      setFilter(item);
                      setPanelActive(false);
                    }}
                  />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default NotificationPage;
