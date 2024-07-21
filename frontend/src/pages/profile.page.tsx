import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Loader from "../components/loader.component";
import AnimationWrapper from "../components/page-animation.component";
import AuthProfileInfo from "../components/profile-info.component";
import InpageNavigation from "../components/inpage-navigation.component";
import BlogCardList from "../components/blog-card-list.component";
import ManageFollowAuthorCardList from "../components/manage-follow-author-card-list.component";

import { FlatIcons } from "../icons/flaticons";

import useNavbarStore from "../states/navbar.state";
import useAuthStore from "../states/user-auth.state";
import useHomeBlogStore from "../states/home-blog.state";
import useAuthorProfileStore from "../states/author-profile.state";
import useSettingStore from "../states/setting.state";
import useProviderStore from "../states/provider.state";
import useDashboardStore from "../states/dashboard.state";

import useUserFetch from "../fetchs/user.fetch";
import useBlogFetch from "../fetchs/blog.fetch";
import useDashboardFetch from "../fetchs/dashboard.fetch";

import {
  AuthorProfileStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

const ProfilePage = () => {
  const navigate = useNavigate();

  const { authorId: paramsAuthor } = useParams();

  const followBtnRef = useRef<HTMLButtonElement>(null);

  const [initialIndex, setInitialIndex] = useState(0);
  const [inPageNavIndex, setInPageNavIndex] = useState(0);
  const [maxMdScreen, setMaxMdScreen] = useState(false);
  const [prevTabs, setPrevTabs] = useState<string[]>([]);

  const { authUser } = useAuthStore();
  const { authorProfileInfo } = useAuthorProfileStore();
  const {
    personal_info: { username: profile_username, profile_img, bio },
    account_info: {
      total_posts,
      total_reads,
      total_followers,
      total_following,
    },
    social_links,
    createdAt,
  } = authorProfileInfo as AuthorProfileStructureType;

  const { theme } = useProviderStore();
  const { searchBarVisibility } = useNavbarStore();
  const { isProfileUpdated, isFollowing } = useSettingStore();
  const { followState, setFollowState } = useAuthorProfileStore();
  const { latestBlogs, initialHomeBlogState } = useHomeBlogStore();
  const {
    allFollowersAuthor,
    allFollowingAuthor,
    followingAuthorByLimit,
    followersAuthorByLimit,
    refreshFollowAuthor,
    setFollowingAuthorByLimit,
    setFollowersAuthorByLimit,
    setAllFollowingAuthor,
    setAllFollowersAuthor,
  } = useDashboardStore();

  const categories = [
    !maxMdScreen && followState.active ? followState.state : "Blogs Published",
    "About",
    followState.state,
  ];

  const { GetLatestBlogsByAuthor } = useBlogFetch();
  const { GetFollowAuthors } = useDashboardFetch();
  const {
    GetAuthorProfileInfo,
    CheckAuthorIsFollowingByUser,
    FollowAuthorByUsername,
  } = useUserFetch();

  // 追蹤作者
  const handleFollow = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!authUser) {
      return navigate("/signin");
    }

    if (paramsAuthor) {
      FollowAuthorByUsername({ authorUsername: paramsAuthor, submitBtn_e: e });
    }
  };

  // 根據點擊的内容呼叫對應的 follow tab
  const handleActiveFollowTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    const state = e.currentTarget.innerText.split(" ")[1];

    setFollowState({ ...followState, active: true, state });

    if (state === "Following") {
      setFollowingAuthorByLimit(null);
      setAllFollowingAuthor(null);
    } else {
      setFollowersAuthorByLimit(null);
      setAllFollowersAuthor(null);
    }
  };

  // 返回上一個頁簽
  const handleNavigateToPrevTab = ({
    toInitialTab = false,
  }: {
    toInitialTab?: boolean;
  }) => {
    // 取出記錄的頁簽列中的最後第二個頁簽，即上一個頁簽
    // 最後一個頁簽是當前頁簽，也是要刪除的頁簽
    const currPrevTab = prevTabs[prevTabs.length - 2];

    if (toInitialTab) {
      setFollowState({
        ...followState,
        active: false,
        state: "Blog Published",
      });
    } else {
      if (currPrevTab) {
        setFollowState({
          ...followState,
          active: currPrevTab !== "Blogs Published" ? true : false,
          state: currPrevTab !== "Blogs Published" ? currPrevTab : "Followers",
        });
      }

      setPrevTabs(prevTabs.slice(0, prevTabs.length - 1));
    }
  };

  // Fetch author profile info
  useEffect(() => {
    if (paramsAuthor) {
      GetAuthorProfileInfo(paramsAuthor);

      // 根據 followState.state 抓取追蹤作者的數據
      // 比如 "Followers" 或 "Following"
      // page:1 代表抓取部分(分頁)，page:0 代表抓取全部
      // 簡而言之，就是根據 followState.state 的不同，同時抓取部分或全部的數據
      // 運用在不同需求的界面上
      GetFollowAuthors({
        page: 1,
        authorUsername: paramsAuthor,
        fetchFor: followState.state.toLowerCase(),
        sortByUpdated:
          followState.state.toLowerCase() === "following" ? true : false,
      });

      GetFollowAuthors({
        page: 0,
        authorUsername: paramsAuthor,
        fetchFor: followState.state.toLowerCase(),
        sortByUpdated:
          followState.state.toLowerCase() === "following" ? true : false,
      });

      // 但不管是因為 followState 變更或是 refreshFollowAuthor 變更，
      // 都需要重新抓取 following 部分的數據
      // 這是為了運用到該類型數據的界面能夠即時更新
      GetFollowAuthors({
        page: 1,
        authorUsername: paramsAuthor,
        fetchFor: "following",
        sortByUpdated: true,
      });

      // 如果已經登入且要查看的作者不是自己，則檢查是否已追蹤該作者
      if (authUser && paramsAuthor !== authUser?.username) {
        CheckAuthorIsFollowingByUser(paramsAuthor);
      }

      return () => {
        initialHomeBlogState();
      };
    }
  }, [authUser, paramsAuthor, followState, refreshFollowAuthor]);

  // Fetch latest blogs by author
  useEffect(() => {
    if (authorProfileInfo?._id) {
      GetLatestBlogsByAuthor({ authorId: authorProfileInfo._id, page: 1 });
    }
  }, [authorProfileInfo]);

  // 如果是因為變更個人資料而傳送過來的，
  // 則在 md-screen 時，自動切換到第二個頁簽，即 "About"
  useEffect(() => {
    if (maxMdScreen && isProfileUpdated) {
      setInitialIndex(1);
    }
  }, [isProfileUpdated, maxMdScreen]);

  // 如果 followState 有改變，
  // 即 followState.state 可能是 "Followers" 或 "Following"
  // 那麼在 max-md screen 且 followState.active 為 true 時，自動點擊目標 ID 頁簽
  // 這樣就可以在 md screen 切換到 max-md screen 時，自動切換到相對應的頁簽
  useEffect(() => {
    if (maxMdScreen && followState.active) {
      document.getElementById(followState.state)?.click();
    }

    // 順便把當前 categories 的第一個頁簽記錄在 prevTabs 中
    // 如果在 md screen 情況，且 prevTabs 已超過一個以上的頁簽，
    // 遇到想返回 Blogs Published 頁簽時，初始化 prevTabs（爲了重新記錄）
    // 因爲那一定是第二種返回方式，即無視上一個 prevtab，直接返回到 Blogs Published
    if (
      !maxMdScreen &&
      categories[0] === "Blogs Published" &&
      prevTabs.length > 0
    ) {
      setPrevTabs(["Blogs Published"]);
    }
    // 而如果當前頁簽與 prevTabs 最後一個頁簽，即上一次的頁簽相同，則不記錄
    // 因為那隻是重複點擊行為
    // 如果是在 max-md screen，則不記錄
    else if (!maxMdScreen && categories[0] !== prevTabs[prevTabs.length - 1]) {
      setPrevTabs([...prevTabs, categories[0]]);
    }
  }, [followState, maxMdScreen]);

  // 偵測螢幕寬度
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMaxMdScreen(true);
      } else {
        setMaxMdScreen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <AnimationWrapper
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!profile_username ? (
        <Loader className={{ container: "mt-5" }} />
      ) : (
        // 因為這個 section 是 flex-row-reverse，
        // 所以 author profile info 在 md-screen 會在右邊；min-screen 會在下面
        // 而 latest blogs 在 md-screen 會在左邊；min-screen 會在右邊
        <section
          className={`
            h-cover
            md:flex
            flex-row-reverse
            items-start
            gap-5
            min-[1100px]:gap-8
            ${searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""}
          `}
        >
          {/* author profile info(md-screen) */}
          <div
            className="
              flex
              flex-col
              min-w-[250px]
              max-md:items-center
              gap-5
              md:w-[400px]
              md:pl-8
              md:border-l
              border-grey-custom
              md:sticky
              md:top-[100px]
              md:py-3
              max-md:pt-5
            "
          >
            {/* Profile image */}
            <img
              src={profile_img}
              className="
                w-48
                h-48
                md:w-32
                md:h-32
                bg-grey-custom
                border-[1px]
                border-grey-custom
                rounded-full
              "
            />

            {/* Profile username */}
            <h1 className="text-xl font-medium">@{profile_username}</h1>

            {/* Profile followers */}
            <button
              onClick={(e) => handleActiveFollowTab(e)}
              className="
                flex
                w-fit
                text-md
                text-grey-dark/50
                hover:text-grey-dark/60
                transition
              "
            >
              {categories[2] !== "Following"
                ? total_following.toLocaleString() + " Following"
                : total_followers.toLocaleString() + " Followers"}
            </button>

            {/* Profile total posts && total reads */}
            <p className="text-md text-grey-dark">
              {total_posts.toLocaleString()} Blogs - {}
              {total_reads.toLocaleString()} Reads
            </p>

            {/* Bio */}
            <p
              className={`
                max-md:hidden
                text-md
                leading-7
                ${
                  !bio.length
                    ? "text-grey-dark/50"
                    : `
                        p-5
                        border-l-4
                        ${
                          theme === "light"
                            ? `
                              text-orange-900
                              border-orange-200
                              bg-orange-100/30
                              `
                            : `
                              text-orange-100
                              border-orange-300/80
                              bg-orange-100/60
                              `
                        }
                        whitespace-pre-wrap
                        rounded-md
                      `
                }
              `}
            >
              {bio.length ? bio : "Nothing to read here"}
            </p>

            {/* Profile edit button | Follow Button */}
            <>
              {paramsAuthor === authUser?.username ? (
                <div
                  className="
                    flex 
                    gap-4
                    mt-2
                  "
                >
                  <Link
                    to={"/settings/edit-profile"}
                    className="
                      btn-light
                      rounded-md
                    "
                  >
                    Edit Profile
                  </Link>
                </div>
              ) : isFollowing ? (
                <div
                  className="
                    flex
                    gap-4
                    mt-2
                  "
                >
                  {/* Following */}
                  <Link
                    to={"/dashboard/friends"}
                    className={`
                      flex
                      gap-2
                      btn-light
                      md:rounded-md
                      justify-center
                      ${
                        theme === "dark"
                          ? `
                            bg-[#1DA1F2]
                            opacity-100
                            `
                          : ``
                      }
                    `}
                  >
                    <FlatIcons
                      name="fi fi-ss-circle-star"
                      className={`
                        flex
                        mt-[3px]
                      `}
                    />
                    <p>Following</p>
                  </Link>
                </div>
              ) : (
                <div
                  className="
                    flex 
                    gap-4 
                    mt-2
                  "
                >
                  <button
                    ref={followBtnRef}
                    onClick={(e) => handleFollow(e)}
                    className={`
                      btn-light
                      text-[13px]
                      md:rounded-md
                      animate-bounce
                      shadow-[0px_1px_5px_0px]
                      shadow-grey-dark/30
                      ${
                        theme === "dark"
                          ? `
                            bg-[#1DA1F2] 
                              opacity-100
                            `
                          : ``
                      }
                    `}
                  >
                    Follow
                  </button>
                </div>
              )}
            </>

            <hr className="my-2 border-grey-custom" />

            {/* Profile info */}
            <AuthProfileInfo
              bio={bio}
              social_links={social_links}
              createdAt={createdAt}
              className="max-md:hidden"
              for_profile={true}
            />
          </div>

          {/* latest blogs(min-screen && md-screen) && author profile info(min-screen) */}
          <div
            className="
              w-full
              max-md:mt-5
            "
          >
            <InpageNavigation
              routes={maxMdScreen ? categories : categories.slice(0, 2)}
              inPageNavIndex={inPageNavIndex}
              setInPageNavIndex={setInPageNavIndex}
              defaultHiddenIndex={1}
              initialActiveIndex={initialIndex}
              adaptiveAdjustment={{ initialToFirstTab: true }}
              navigatePrevTab={{
                active: followState.active,
                onClick: (props) =>
                  handleNavigateToPrevTab({ ...props, toInitialTab: true }),
              }}
            >
              {/* latest blogs && Follow */}
              <>
                {followState.active && !maxMdScreen ? (
                  followState.state === "Followers" ? (
                    <ManageFollowAuthorCardList
                      data={allFollowersAuthor as GenerateToLoadStructureType}
                      for_fetch="followers"
                      for_page={false}
                    />
                  ) : (
                    <ManageFollowAuthorCardList
                      data={allFollowingAuthor as GenerateToLoadStructureType}
                      for_fetch="following"
                      for_page={false}
                    />
                  )
                ) : (
                  <BlogCardList
                    id="profile-authorBlogs"
                    data={latestBlogs as GenerateToLoadStructureType}
                    noDataMessage={"No blogs published"}
                    loadLimit={import.meta.env.VITE_BLOGS_LIMIT}
                    loadFunction={(props) =>
                      GetLatestBlogsByAuthor({
                        ...props,
                        authorId: authorProfileInfo?._id,
                      })
                    }
                  />
                )}
              </>

              {/* Profile info */}
              <AuthProfileInfo
                bio={bio}
                social_links={social_links}
                createdAt={createdAt}
                className="md:hidden"
              />

              {/* Follow card for max-md screen */}
              <>
                {maxMdScreen ? (
                  followState.state === "Followers" ? (
                    <ManageFollowAuthorCardList
                      data={
                        followersAuthorByLimit as GenerateToLoadStructureType
                      }
                      for_fetch="followers"
                    />
                  ) : (
                    <ManageFollowAuthorCardList
                      data={
                        followingAuthorByLimit as GenerateToLoadStructureType
                      }
                      for_fetch="following"
                      sortByUpdated={true}
                    />
                  )
                ) : (
                  ""
                )}
              </>
            </InpageNavigation>
          </div>
        </section>
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
