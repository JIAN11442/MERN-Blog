import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AnimationWrapper from "../components/page-animation.component";
import Loader from "../components/loader.component";
import AuthProfileInfo from "../components/profile-info.component";
import InpageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-card-banner.component";
import LoadOptions from "../components/load-options.components";
import NoDataMessage from "../components/blog-nodata.component";

import { FlatIcons } from "../icons/flaticons";

import useUserFetch from "../fetchs/user.fetch";
import useBlogFetch from "../fetchs/blog.fetch";

import useNavbarStore from "../states/navbar.state";
import useAuthStore from "../states/user-auth.state";
import useHomeBlogStore from "../states/home-blog.state";
import useAuthorProfileStore from "../states/author-profile.state";
import useSettingStore from "../states/setting.state";
import useProviderStore from "../states/provider.state";

import {
  AuthorProfileStructureType,
  AuthorStructureType,
  type BlogStructureType,
} from "../commons/types.common";
import useDashboardFetch from "../fetchs/dashboard.fetch";

const ProfilePage = () => {
  const navigate = useNavigate();

  const { authorId: paramsAuthor } = useParams();

  const followBtnRef = useRef<HTMLButtonElement>(null);

  const [initialIndex, setInitialIndex] = useState(0);
  const [inPageNavIndex, setInPageNavIndex] = useState(0);
  const [maxMdScreen, setMaxMdScreen] = useState(false);

  const categories = ["Blogs Published", "About", "Following"];

  const { authUser } = useAuthStore();
  const { authorProfileInfo } = useAuthorProfileStore();
  const {
    personal_info: { username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads, total_followers },
    social_links,
    createdAt,
  } = authorProfileInfo as AuthorProfileStructureType;

  const { theme } = useProviderStore();
  const { searchBarVisibility } = useNavbarStore();
  const { isProfileUpdated, isFollowing } = useSettingStore();
  const { latestBlogs, loadBlogsLimit, initialHomeBlogState } =
    useHomeBlogStore();

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

  // Fetch author profile info
  useEffect(() => {
    if (paramsAuthor) {
      GetAuthorProfileInfo(paramsAuthor);
      GetFollowAuthors({
        page: 1,
        authorUsername: paramsAuthor,
        fetchFor: "following",
      });

      // 如果已經登入且要查看的作者不是自己，則檢查是否已追蹤該作者
      if (authUser && paramsAuthor !== authUser?.username) {
        CheckAuthorIsFollowingByUser(paramsAuthor);
      }

      return () => {
        initialHomeBlogState();
      };
    }
  }, [authUser, paramsAuthor]);

  // Fetch latest blogs by author
  useEffect(() => {
    if (authorProfileInfo?._id) {
      GetLatestBlogsByAuthor({ authorId: authorProfileInfo._id, page: 1 });
    }
  }, [authorProfileInfo]);

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

  // 如果是因為變更個人資料而傳送過來的，
  // 則在 md-screen 時，自動切換到第二個頁簽，即 "About"
  useEffect(() => {
    if (maxMdScreen && isProfileUpdated) {
      setInitialIndex(1);
    }
  }, [isProfileUpdated, maxMdScreen]);

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
            min-[1100px]:gap-12
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
              md:py-10
              md:h-[85vh]
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

            {/* Profile followers && following */}
            <p className="text-md text-grey-dark/50">
              {total_followers.toLocaleString()} Followers
            </p>

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
              max-md:mt-12 
            "
          >
            <InpageNavigation
              routes={maxMdScreen ? categories : categories.slice(0, 2)}
              inPageNavIndex={inPageNavIndex}
              setInPageNavIndex={setInPageNavIndex}
              defaultHiddenIndex={1}
              initialActiveIndex={initialIndex}
              adaptiveAdjustment={{ initialToFirstTab: true }}
            >
              {/* latest blogs */}
              <>
                {latestBlogs === null ? (
                  <Loader />
                ) : "results" in latestBlogs && latestBlogs?.results?.length ? (
                  <div>
                    {latestBlogs?.results?.map((blog: BlogStructureType, i) => {
                      const { author } = blog;
                      const { personal_info } = author as AuthorStructureType;

                      return (
                        <AnimationWrapper
                          key={blog.title}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                          <BlogPostCard author={personal_info} content={blog} />
                        </AnimationWrapper>
                      );
                    })}

                    {/* Load Operation */}
                    <LoadOptions
                      id="authorBlogs"
                      data={latestBlogs}
                      loadLimit={loadBlogsLimit}
                      authorId={authorProfileInfo?._id}
                      loadFunction={GetLatestBlogsByAuthor}
                    />
                  </div>
                ) : (
                  <NoDataMessage message="No blogs published" />
                )}
              </>

              {/* Profile info */}
              <AuthProfileInfo
                bio={bio}
                social_links={social_links}
                createdAt={createdAt}
                className="md:hidden"
              />
            </InpageNavigation>
          </div>
        </section>
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
