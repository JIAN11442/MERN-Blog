import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { FlatIcons } from '../icons/flaticons';

import logo from '../imgs/logo.png';
import useAuthStore from '../states/auth.state';
import UserNavigationPanel from './user-navigation.component';

const Navbar = () => {
  const [searchBarVisibility, setSearchBarVisibility] =
    useState<boolean>(false);

  const currPath = useLocation().pathname;
  const { authUser } = useAuthStore();

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/">
          <img
            src={logo}
            alt="Blogging"
            className="
              flex-none
              w-10
            "
          />
        </Link>
        {/* Search Bar */}
        <div
          className={`
            group
            absolute
            w-full
            left-0
            top-full
            mt-0.5
            py-4
            px-[5vw]
            border-b
            border-grey-custom
            md:border-0
            md:block
            md:relative
            md:inset-0
            md:p-0
            md:w-auto
            md:show
            ${searchBarVisibility ? 'show' : 'hide'}
          `}
        >
          {/* Input */}
          <input
            type="text"
            placeholder="Search"
            className="
              w-full
              bg-grey-custom
              placeholder-grey-dark
              p-4
              pl-6
              pr-[12%]
              rounded-full
              md:w-auto
              md:pr-6
              md:pl-12
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
              text-grey-dark
              md:pointer-events-none
              md:left-5
            "
          />
        </div>

        {/* Search Button && Editor Button && Login Button && Signup Button */}
        <div
          className="
            flex
            items-center
            gap-3
            ml-auto
            md:gap-4
            transition
          "
        >
          {/* Search Button */}
          <button
            onClick={() => setSearchBarVisibility(!searchBarVisibility)}
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
            to={'/editor'}
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
              <Link to="/dashboard/notification">
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
                </button>
              </Link>
              <div className="relative">
                <button className="w-12 h-12 mt-1">
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
                <UserNavigationPanel />
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                to={'/signin'}
                className={`
                    ${
                      currPath === '/signin'
                        ? 'hidden md:block md:btn-dark'
                        : currPath === '/signup'
                        ? 'btn-dark md:btn-light'
                        : 'btn-dark'
                    }
                `}
              >
                Sign In
              </Link>

              {/* Signup Button */}
              <Link
                to={'/signup'}
                className={`
                  ${
                    currPath === '/signup'
                      ? 'hidden md:block md:btn-dark'
                      : currPath === '/signin'
                      ? 'btn-dark md:btn-light'
                      : 'hidden'
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
