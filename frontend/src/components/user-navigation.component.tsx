import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { FlatIcons } from "../icons/flaticons";
import useAuthStore from "../states/user-auth.state";
import AnimationWrapper from "./page-animation.component";

const UserNavigationPanel = () => {
  const { authUser, setAuthUser } = useAuthStore();

  // Sign out function
  const handleSignOut = () => {
    sessionStorage.removeItem("access_token");
    setAuthUser(null);
    toast.success("Signed out successfully!");
  };

  return (
    <AnimationWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="
        absolute
        right-0
        z-50
        shadow-[0px_0px_5px_1px_rgba(0,0,0,0)]
        shadow-grey-dark/15
        rounded-md
      "
    >
      <div
        className="
          w-60
          border
          bg-white-custom
          border-grey-custom
          duration-200
        "
      >
        {/* Editor */}
        <Link to="/editor" className="flex gap-4 link md:hidden pl-8">
          <FlatIcons name="fi fi-rr-file-edit" />
          <p>Write</p>
        </Link>

        {/* Profile */}
        <Link
          to={`/user/${authUser?.username}`}
          className="flex gap-4 link pl-8"
        >
          <FlatIcons name="fi fi-rr-user" />
          <p>Profile</p>
        </Link>

        {/* Dashboard */}
        <Link to="/dashboard/blogs" className="flex gap-4 link pl-8">
          <FlatIcons name="fi fi-rr-dashboard" />
          <p>Dashboard</p>
        </Link>

        {/* Settings */}
        <Link to="/settings/edit-profile" className="flex gap-4 link pl-8">
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
