import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FlatIcons } from "../icons/flaticons";
import useAuthStore from "../states/user-auth.state";
import AnimationWrapper from "./page-animation.component";
import useEditorBlogStore from "../states/blog-editor.state";
import useHomeBlogStore from "../states/home-blog.state";
import useAuthorProfileStore from "../states/author-profile.state";
import { useEffect, useRef } from "react";
import useNavbarStore from "../states/navbar.state";

const UserNavigationPanel = () => {
  const navigate = useNavigate();

  const panelRef = useRef<HTMLDivElement>(null);

  const { authUser, setAuthUser } = useAuthStore();
  const { initialEditBlog } = useEditorBlogStore();
  const { initialHomeBlogState } = useHomeBlogStore();
  const { initialAuthorProfileInfo } = useAuthorProfileStore();
  const { setPanelCollapsed } = useNavbarStore();

  // Sign out function
  const handleSignOut = () => {
    // 離開前先清除所有的資料
    // 這樣下次登入時就不會有任何資料殘留
    // 也不會因爲殘留資料而沒抓取資料
    setAuthUser(null);
    initialHomeBlogState();
    initialEditBlog();
    initialAuthorProfileInfo();
    handleNavigate();

    sessionStorage.removeItem("access_token");

    toast.success("Signed out successfully!");

    navigate("/");
  };

  const handleNavigate = () => {
    setPanelCollapsed(false);
  };

  useEffect(() => {
    const handleOnBlur = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelCollapsed(false);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleOnBlur);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleOnBlur);
    };
  }, [panelRef]);

  return (
    <AnimationWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="
        absolute
        right-0
        z-20
        shadow-[0px_0px_5px_1px]
        shadow-grey-dark/15
        rounded-md
      "
    >
      <div
        ref={panelRef}
        className="
          w-60
          border
          bg-white-custom
          border-grey-custom
          duration-200
        "
      >
        {/* Editor */}
        <Link
          to="/editor"
          onClick={() => {
            initialEditBlog();
            setPanelCollapsed(false);
          }}
          className="flex gap-4 link md:hidden pl-8"
        >
          <FlatIcons name="fi fi-rr-file-edit" />
          <p>Write</p>
        </Link>

        {/* Profile */}
        <Link
          onClick={handleNavigate}
          to={`/user/${authUser?.username}`}
          className="flex gap-4 link pl-8"
        >
          <FlatIcons name="fi fi-rr-user" />
          <p>Profile</p>
        </Link>

        {/* Dashboard */}
        <Link
          onClick={handleNavigate}
          to="/dashboard/blogs"
          className="flex gap-4 link pl-8"
        >
          <FlatIcons name="fi fi-rr-dashboard" />
          <p>Dashboard</p>
        </Link>

        {/* Settings */}
        <Link
          onClick={handleNavigate}
          to="/settings/edit-profile"
          className="flex gap-4 link pl-8"
        >
          <FlatIcons name="fi fi-rr-settings" />
          <p>Settings</p>
        </Link>

        {/* Separate line */}
        <span
          className="
            absolute
            border-t
            border-grey-custom
            w-[100%] 
        "
        ></span>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="
            group
            flex
            gap-4
            items-center
            w-full
            p-3
            px-4
            pl-8
            text-left
            hover:bg-grey-custom
            transition
          "
        >
          <FlatIcons
            name="fi fi-rs-log-out"
            className="text-grey-dark text-opacity-75 group-hover:text-opacity-100"
          />
          <div>
            <h1 className="text-md font-bold">Sign Out</h1>
            <p className="text-sm text-grey-dark opacity-75">
              @{authUser?.username}
            </p>
          </div>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
