import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { EditIcon, SearchIcon } from '../icons/flaticons';

import logo from '../imgs/logo.png';

const Navbar = () => {
  const [searchBarVisibility, setSearchBarVisibility] =
    useState<boolean>(false);

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
          <SearchIcon
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
            md:gap-6
            transition
          "
        >
          {/* Search Button */}
          <button
            onClick={() => setSearchBarVisibility(!searchBarVisibility)}
            className="
              flex
              md:hidden
              bg-grey-custom
              w-11
              h-11
              rounded-full
              items-center
              justify-center
              hover:opacity-80
              transition
            "
          >
            <SearchIcon className="text-md" />
          </button>

          {/* Editor Button */}
          <Link
            to={'/editor'}
            className="
              link
              hidden
              gap-2
              md:flex
            "
          >
            <EditIcon />
            <p>Write</p>
          </Link>

          {/* Login Button */}
          <Link
            to={'/signin'}
            className="
              btn-dark
              py-2
            "
          >
            Sign In
          </Link>

          {/* Signup Button */}
          <Link
            to={'/signup'}
            className="
              btn-light
              py-2
              hidden
              md:block
            "
          >
            Sign up
          </Link>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
