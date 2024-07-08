import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { FlatIcons } from "../icons/flaticons";

import logo from "../imgs/logo.png";

import AnimationWrapper from "./page-animation.component";
import UserNavigationPanel from "./user-navigation-panel.component";

import useAuthStore from "../states/user-auth.state";
import useNavbarStore from "../states/navbar.state";
import useEditorBlogStore from "../states/blog-editor.state";

import useDashBoardFetch from "../fetchs/dashboard.fetch";

const Navbar = () => {
  const navigate = useNavigate();
  const currPath = useLocation().pathname;
  const searchBarRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);

  const { authUser } = useAuthStore();
  const { access_token, notification } = authUser ?? {};

  const {
    panelCollapsed,
    setPanelCollapsed,
    searchBarVisibility,
    setSearchBarVisibility,
  } = useNavbarStore();
  const { initialEditBlog } = useEditorBlogStore();

  const { GetNotificationsByUserId } = useDashBoardFetch();

  // 控制 SearchBar 的顯示與隱藏
  const handleSearchBar = () => {
    setSearchBarVisibility(!searchBarVisibility);
  };

  // SearchBar 按下 Enter 後跳轉至搜尋結果頁面
  const handleSearchBarSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const query = (e.target as HTMLInputElement).value;

    if (e.key === "Enter" && query.length) {
      navigate(`/search/${query}`);
    }
  };

  // 控制 NavigationPanel 的顯示與隱藏
  const handlePanelCollapse = () => {
    setPanelCollapsed(!panelCollapsed);
  };

  // 控制 NavigationPanel 在失焦後隱藏
  const handlePanelBlur = () => {
    const timeout = setTimeout(() => {
      setPanelCollapsed(false);
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  };

  // 點擊 Logo 返回首頁
  const handleBacktoHome = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    // 讓 link 不要跳轉
    e.preventDefault();
    // 再重新載入頁面，以便重新取得資料，數據也能得到重置
    window.location.href = "/";
  };

  // 搜尋欄顯示時，自動 focus
  useEffect(() => {
    if (searchBarVisibility) {
      searchBarRef.current?.focus();
    }
  }, [searchBarVisibility, searchBarRef]);

  // 點擊頁面其他地方，隱藏 SearchBar
  useEffect(() => {
    const handleOnBlur = (e: MouseEvent) => {
      if (
        searchBarVisibility &&
        searchBtnRef.current &&
        searchBarRef.current &&
        !searchBtnRef.current.contains(e.target as Node) &&
        !searchBarRef.current.contains(e.target as Node)
      ) {
        setSearchBarVisibility(false);
      }
    };

    window.addEventListener("click", handleOnBlur);

    return () => {
      window.removeEventListener("click", handleOnBlur);
    };
  }, [searchBarVisibility, searchBtnRef]);

  // 取得通知
  useEffect(() => {
    if (access_token) {
      // 這裡設定 100ms 的延遲，
      // 避免 GetNotificationsByUserId 在 jwtVerify 時來不及取得 access_token 就執行
      // 結果返回 token null
      // 當然在刷新時也是同理，延遲是為了讓 jwtVerify 先執行，再執行 GetNotificationsByUserId()
      // 不然 GetNotificationsByUserId() 取得的 notification 會被 jwtVerify 覆蓋
      // 導致 notification 一直是 null
      const timeout = setTimeout(() => {
        GetNotificationsByUserId();
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [authUser?.access_token]);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link
          to="/"
          className="flex-none w-10"
          onClick={(e) => handleBacktoHome(e)}
        >
          <img src={logo} alt="Blogging" />
        </Link>

        {/* Search Bar */}
        <AnimationWrapper
          key="searchBar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`
              ${searchBarVisibility ? "block" : "hidden"}
              group
              absolute
              w-full
              left-0
              top-full
              py-4
              px-[5vw]
              bg-white-custom
              border-y
              border-grey-custom
              md:border-0
              md:block
              md:relative
              md:inset-0
              md:p-0
              md:w-auto
              md:show
            `}
          >
            {/* Input */}
            <input
              ref={searchBarRef}
              type="text"
              placeholder="Search..."
              onKeyDown={(e) => handleSearchBarSubmit(e)}
              className="
                w-full
                bg-grey-custom
                placeholder:text-grey-dark/50
                focus:placeholder:opacity-0
                p-4
                pl-6
                pr-[12%]
                rounded-full
                md:w-auto
                md:pr-6
                md:pl-[3.5rem]
              "
            />
            {/* SearchIcon */}
            <FlatIcons
              name="fi fi-rr-search"
              className="
                absolute
                right-[10%]
                top-1/2
                -translate-y-1/2
                text-md
                text-grey-dark/50
                md:pointer-events-none
                md:left-5
              "
            />
          </div>
        </AnimationWrapper>

        {/* Search Button && Editor Button && Login Button && Signup Button */}
        <div
          className="
            flex
            items-center
            gap-3
            ml-auto
            transition
          "
        >
          {/* Search Button */}
          <button
            ref={searchBtnRef}
            onClick={handleSearchBar}
            className="
              md:hidden
              bg-grey-custom
              w-12
              h-12
              rounded-full
              items-center
              justify-center
              hover:opacity-80
              transition
            "
          >
            <FlatIcons
              name="fi fi-rr-search"
              className="scale-[1.25] pt-0.5 block"
            />
          </button>

          {/* Editor Button */}
          <Link
            to={"/editor"}
            onClick={initialEditBlog}
            className={`
              link
              hidden
              py-2
              gap-2
              md:flex
            `}
          >
            <FlatIcons name="fi fi-rr-file-edit" />
            <p>Write</p>
          </Link>

          {authUser ? (
            <>
              {/* Notification */}
              <Link to="/dashboard/notifications">
                <button
                  className="
                    w-12
                    h-12
                    relative
                    items-center
                    justify-center
                    rounded-full
                    bg-grey-custom
                    hover:bg-black-custom/10
                  "
                >
                  <FlatIcons
                    name="fi fi-rr-bell"
                    className="scale-[1.25] pt-0.5 block"
                  />
                  {notification?.totalCount ? (
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
                      {notification.totalCount}
                    </span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>

              {/* Avatar && NavigationPanel */}
              <div className="relative">
                {/* Avatar */}
                <button
                  onClick={handlePanelCollapse}
                  onBlur={handlePanelBlur}
                  className="w-12 h-12 mt-1"
                >
                  <img
                    src={authUser.profile_img}
                    className="
                      w-full
                      h-full
                      object-cover
                      rounded-full
                    "
                  />
                </button>

                {/* NavigationPanel */}
                {panelCollapsed && <UserNavigationPanel />}
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                to={"/signin"}
                className={`
                    ${
                      currPath === "/signin"
                        ? "hidden md:block md:btn-dark"
                        : currPath === "/signup"
                        ? "btn-dark md:btn-light"
                        : "btn-dark"
                    }
                `}
              >
                Sign In
              </Link>

              {/* Signup Button */}
              <Link
                to={"/signup"}
                className={`
                  ${
                    currPath === "/signup"
                      ? "hidden md:block md:btn-dark"
                      : currPath === "/signin"
                      ? "btn-dark md:btn-light"
                      : "hidden"
                  }
                `}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
