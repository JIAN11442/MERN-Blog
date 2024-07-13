import { useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";

import useAuthStore from "../states/user-auth.state";
import { FlatIcons } from "../icons/flaticons";
import toast from "react-hot-toast";
import useNavbarStore from "../states/navbar.state";

const SideNavbar = () => {
  const pathName = location.pathname.split("/")[2];

  const activeTabLineRef = useRef<HTMLHRElement>(null);
  const sideNavbarBtnRef = useRef<HTMLButtonElement>(null);
  const pageStateBtnRef = useRef<HTMLButtonElement>(null);

  const [sideBarVisible, setSideBarVisible] = useState(false);
  const [pageState, setPageState] = useState(pathName?.replace("-", " "));

  const { searchBarVisibility } = useNavbarStore();

  const { authUser } = useAuthStore();
  const { access_token, notification } = authUser ?? {};

  const handleNavigatePage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { innerText } = e.currentTarget;

    // 如果目前點擊的是 Change Password 且使用者是透過 Google 登入的話，
    // 出現警告訊息，且不給予更改密碼的權限
    if (innerText === "Change Password" && authUser?.google_auth) {
      return toast.error(
        "You can't change account's password because you logged in through Google account."
      );
    }

    // 不是的話會正常導向
    // 然後 pathName 會改變，而觸發 useEffect 來改變 pageState
    // 所以這一步要先將 sideBarVisible 設為 false，讓 sideBar 隱藏
    setSideBarVisible(false);

    if (pageStateBtnRef.current) {
      pageStateBtnRef.current.click();
    }
  };

  const changePageState = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { offsetWidth, offsetLeft } = e.target as HTMLButtonElement;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
    }

    if (e.target === sideNavbarBtnRef.current) {
      setSideBarVisible(true);
    } else {
      setSideBarVisible(false);
    }
  };

  // 當 pathName 改變時，改變 pageState
  useEffect(() => {
    if (pathName) {
      if (pathName.slice(-1) === "s") {
        setPageState(pathName.slice(0, -1).replace("-", " "));
      } else {
        setPageState(pathName.replace("-", " "));
      }
    }
  }, [pathName]);

  // 當切換頁簽時，自動點擊 pageStateBtnRef
  // 這樣就可以讓 activeTabLine 跟著移動
  useEffect(() => {
    if (pageStateBtnRef.current) {
      setSideBarVisible(false);

      pageStateBtnRef.current.click();
    }
  }, [pageState]);

  // 如果第一次進入頁面是在 md 以上的寬度，這時候 activeTabLine 是 null，因為還沒有渲染
  // 而如果這時候 resize 到 md 以下的寬度，因為 activeTabLine 是 null，
  // 所以 activeTabLine 的 offsetLeft 及 offsetWidth 也都會是 0，這樣當然不會出現我們要的下劃線效果
  // 所以我們這裡要監聽遊覽器寬度，
  // 當監測到寬度小於 768 時，即 tailwindcss 中的 max-md 寬度，
  // 自動點擊 pageStateBtnRef，讓 activeTabLine 跟著移動
  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth <= 768 &&
        pageStateBtnRef.current &&
        activeTabLineRef.current?.offsetLeft === 0
      ) {
        pageStateBtnRef.current.click();
      }
    };

    // 第一次進入頁面時，就執行 handleResize
    // 而不是等到 resize 時才執行，那就太晚了
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {access_token === undefined ? (
        <Navigate to="/signin" />
      ) : (
        <>
          <section
            className={`
              relative
              flex
              gap-10
              py-0
              m-0
              max-md:flex-col
              ${
                searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""
              }
            `}
          >
            {/* InpageNavigation categories tab - max-md screen */}
            <div
              className="
               relative
               md:hidden
               flex
               flex-nowrap
               bg-white-custom
               py-1
               border-b
               border-grey-custom
              "
            >
              {/* Side navbar icon button */}
              <button
                ref={sideNavbarBtnRef}
                onClick={(e) => changePageState(e)}
                className={`
                  p-5 
                  capitalize
                  ${sideBarVisible ? "opacity-100" : "opacity-30"}
                `}
              >
                <FlatIcons
                  name="fi fi-rr-bars-staggered"
                  className="pointer-events-none"
                />
              </button>

              {/* Page state button */}
              <button
                ref={pageStateBtnRef}
                onClick={(e) => changePageState(e)}
                className={`
                  p-5 
                  capitalize
                  truncate
                  ${!sideBarVisible ? "opacity-100" : "opacity-30"}
                `}
              >
                {pageState}
              </button>

              {/* Active tab line */}
              <hr
                ref={activeTabLineRef}
                className="
                  absolute
                  bottom-0
                  duration-300
                border-black-custom
                "
              />
            </div>

            {/* Side navbar */}
            <div
              className={`
                min-w-[250px]
                h-cover
                flex
                flex-col
                gap-20
                p-6
                bg-white-custom
                overflow-y-auto
                md:sticky
                md:pr-0
                md:border-grey-custom
                md:border-r
                max-md:absolute
                max-md:top-[64px]
                max-md:w-full
                max-md:px-16
                max-md:-ml-7
                duration-500
                ${!sideBarVisible && "max-md:hidden"}
              `}
            >
              {/* Dashboard */}
              <div>
                {/* Title */}
                <h1
                  className="
                    text-xl
                    text-grey-dark
                    font-semibold
                    mb-3
                  "
                >
                  Dashboard
                </h1>

                {/* Separate Line */}
                <hr className="-ml-6 mb-8 mr-6 border-grey-custom" />

                {/* Blog 
                    這裡使用 NavLink 而不是 Link 的原因是因為 NavLink 可以讓我們在點擊時自動加上 active 的 class
                    這樣我們只要事先在 css 設定好 active 的樣式，就可以在點擊後立馬套用
                */}
                <NavLink
                  to="/dashboard/blogs"
                  onClick={(e) => handleNavigatePage(e)}
                  className="sidebar-link"
                >
                  <FlatIcons name="fi fi-rr-document" />
                  <p className="truncate">Blog</p>
                </NavLink>

                {/* Notification */}
                <NavLink
                  to="/dashboard/notifications"
                  onClick={(e) => handleNavigatePage(e)}
                  className="sidebar-link"
                >
                  <div className="relative">
                    <FlatIcons name="fi fi-rr-bell" />
                    {notification?.totalCount ? (
                      <span
                        className="
                          absolute
                          top-[-2px]
                          right-[-1px]
                          w-[6px]
                          h-[6px]
                          bg-red-custom
                          rounded-full
                          z-10
                        "
                      ></span>
                    ) : (
                      ""
                    )}
                  </div>
                  <p className="truncate">Notification</p>
                </NavLink>

                {/* Write */}
                <NavLink
                  to="/editor"
                  onClick={(e) => handleNavigatePage(e)}
                  className="sidebar-link"
                >
                  <FlatIcons name="fi-rr-file-edit" />
                  <p className="truncate">Write</p>
                </NavLink>
              </div>

              {/* Settings */}
              <div>
                {/* Title */}
                <h1
                  className="
                    text-xl
                    text-grey-dark
                    font-semibold
                    mb-3
                  "
                >
                  Settings
                </h1>

                {/* Separate Line */}
                <hr className="-ml-6 mb-8 mr-6 border-grey-custom" />

                {/* Edit Profile */}
                <NavLink
                  to="/settings/edit-profile"
                  onClick={(e) => handleNavigatePage(e)}
                  className="sidebar-link"
                >
                  <FlatIcons name="fi fi-rr-user" />
                  <p className="truncate">Edit Profile</p>
                </NavLink>

                {/* Change Password */}
                <NavLink
                  to={`${
                    authUser?.google_auth ? "#" : "/settings/change-password"
                  }`}
                  onClick={(e) => handleNavigatePage(e)}
                  className={`
                    ${
                      authUser?.google_auth
                        ? `
                            flex
                            p-5
                            mb-2
                            max-md:mr-10
                            gap-4 
                            items-center 
                          text-grey-dark/30  
                        
                          `
                        : "sidebar-link"
                    }
                  `}
                >
                  <FlatIcons name="fi fi-rr-lock" />
                  <p className="truncate">Change Password</p>
                </NavLink>
              </div>
            </div>

            {/* Content of PageState */}
            <div
              className={`
                mt-5
                w-full
                ${sideBarVisible ? "max-md:hidden" : "max-md:-mt-4"}

              `}
            >
              <Outlet />
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default SideNavbar;
