import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { FlatIcons } from '../icons/flaticons';
import useAuthStore from '../states/auth.state';
import AniamationWrapper from '../commons/page-animation.common';

const UserNavigationPanel = () => {
  const { authUser, setAuthUser } = useAuthStore();

  // Sign out function
  const handleSignOut = () => {
    sessionStorage.removeItem('access_token');
    setAuthUser(null);
    toast.success('Signed out successfully!');
  };

  return (
    <AniamationWrapper
      transition={{ duration: 0.2 }}
      className="
        absolute
        right-0
        z-50
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
        <Link
          to="/editor"
          className="
            flex
            gap-2
            link
            md:hidden
            pl-8
            py-4
          "
        >
          <FlatIcons name="fi fi-rr-file-edit" />
          <p>Write</p>
        </Link>

        {/* Profile */}
        <Link
          to={`/user/${authUser?.username}`}
          className="
            link
            pl-8
            py-4
          "
        >
          Profile
        </Link>

        {/* Dashboard */}
        <Link
          to="/dashboard/blogs"
          className="
            link
            pl-8
            py-4
          "
        >
          Dashboard
        </Link>

        {/* Settings */}
        <Link
          to="/settings/edit-profile"
          className="
            link
            pl-8
            py-4
          "
        >
          Settings
        </Link>

        <span
          className="
            absolute
            border-t
            border-grey-custom
            w-[100%] 
        "
        ></span>

        <button
          onClick={handleSignOut}
          className="
            w-full
            p-4
            pl-8
            text-left
            hover:bg-grey-custom
          "
        >
          <h1
            className="
              font-bold
              text-xl
              mb-1
            "
          >
            Sign Out
          </h1>
          <p className="text-grey-dark">@{authUser?.username}</p>
        </button>
      </div>
    </AniamationWrapper>
  );
};

export default UserNavigationPanel;
