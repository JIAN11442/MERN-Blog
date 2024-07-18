import { useEffect, useState } from "react";
import { FlatIcons } from "../icons/flaticons";

import InpageNavigation from "../components/inpage-navigation.component";
import ManageFollowAuthorCardList from "../components/manage-follow-author-card-list.component";

import useDashboardStore from "../states/dashboard.state";
import useAuthStore from "../states/user-auth.state";

import useDashboardFetch from "../fetchs/dashboard.fetch";
import { GenerateToLoadStructureType } from "../commons/types.common";

const AuthorManagementPage = () => {
  const inpageNavOptions = ["Following", "Followers"];

  const [inPageNavIndex, setInPageNavIndex] = useState(0);

  const { authUser } = useAuthStore();
  const {
    authorQuery,
    followingAuthorByLimit,
    followersAuthorByLimit,
    setAuthorQuery,
    setFollowingAuthorByLimit,
    setFollowersAuthorByLimit,
  } = useDashboardStore();

  const { GetFollowAuthors, ClearAllFollowAuthors } = useDashboardFetch();

  // 搜索框的提交事件
  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    if (e.key === "Enter" && value.length > 0 && value !== authorQuery) {
      setFollowingAuthorByLimit(null);
      setFollowersAuthorByLimit(null);

      setAuthorQuery(value);
    }
  };

  // 如果搜索框失去焦點，並且搜索框的值為空，
  // 則清空搜索結果，且觸發 useEffect 重新獲取數據
  // 簡單來說就是還原初始資料
  const handleInputOnBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (authorQuery.length > 0 && value.length === 0) {
      setFollowingAuthorByLimit(null);
      setFollowersAuthorByLimit(null);

      setAuthorQuery(value);
    }
  };

  // 切換 inpageNavIndex
  const handleSwitchInpageNav = (index: number) => {
    setInPageNavIndex(index);
  };

  const handleClearAllFollowAuthors = () => {
    ClearAllFollowAuthors();
  };

  useEffect(() => {
    GetFollowAuthors({
      page: 1,
      authorUsername: authUser?.username,
      query: authorQuery,
      fetchFor: "following",
      sortByUpdated: true,
    });

    GetFollowAuthors({
      page: 1,
      authorUsername: authUser?.username,
      query: authorQuery,
      fetchFor: "followers",
    });
  }, [authUser, authorQuery, inPageNavIndex]);

  return (
    <div>
      {/* Title */}
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <h1
          className="
          max-md:hidden
          mb-5
          text-xl
          font-medium
          truncate
        "
        >
          Manager Friends
        </h1>

        <button
          onClick={handleClearAllFollowAuthors}
          className="
            flex
            max-md:pb-5
            max-md:ml-auto
            md:-mt-5
            text-grey-dark/50
            hover:text-grey-dark/30
          "
        >
          clear all
        </button>
      </div>

      {/* SearchBar */}
      <div
        className="
          relative
          mb-5
        "
      >
        <input
          type="text"
          placeholder={`Search ${inpageNavOptions[
            inPageNavIndex
          ].toLowerCase()}...`}
          onBlur={(e) => handleInputOnBlur(e)}
          onKeyDown={(e) => handleInputSubmit(e)}
          className="
            w-full
            p-4
            md:pl-14
            max-md:pl-5
            pr-6
            bg-grey-custom
            rounded-md
            placeholder:text-grey-dark/50
            focus:placeholder:opacity-0
          "
        />

        <FlatIcons
          name="fi fi-rr-search"
          className="
            absolute
            max-md:right-5
            md:left-5
            md:pointer-events-none
            top-1/2
            -translate-y-1/2
            text-md
            text-grey-dark/50
          "
        />
      </div>

      {/* InpageNavigateBtn - max-md screen */}
      <div
        className="
          flex
          gap-4
          pt-5
          pb-6
          md:hidden
        "
      >
        {inpageNavOptions.map((route, i) => (
          <button
            key={i}
            onClick={() => handleSwitchInpageNav(i)}
            className={`
              ${
                route === inpageNavOptions[inPageNavIndex]
                  ? "btn-dark"
                  : "btn-light"
              }
            `}
          >
            {route}
          </button>
        ))}
      </div>

      {/* InpageNavigation - md screen */}
      <InpageNavigation
        routes={inpageNavOptions}
        inPageNavIndex={inPageNavIndex}
        setInPageNavIndex={setInPageNavIndex}
        adaptiveAdjustment={{ initialToFirstTab: false }}
        className="
          max-md:hidden
          mb-6
        "
      >
        {/* Following */}
        <ManageFollowAuthorCardList
          data={followingAuthorByLimit as GenerateToLoadStructureType}
          for_fetch="following"
          for_page={true}
          query={authorQuery}
          btnStyle="max-md:rounded-md"
          sortByUpdated={true}
        />

        {/* Followers */}
        <ManageFollowAuthorCardList
          data={followersAuthorByLimit as GenerateToLoadStructureType}
          for_fetch="followers"
          for_page={true}
          query={authorQuery}
          btnStyle="max-md:rounded-md"
        />
      </InpageNavigation>
    </div>
  );
};

export default AuthorManagementPage;
