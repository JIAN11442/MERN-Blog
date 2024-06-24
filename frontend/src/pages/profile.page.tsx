import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import AnimationWrapper from "../components/page-animation.component";
import Loader from "../components/loader.component";
import AuthProfileInfo from "../components/profile-info.component";
import InpageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-card-banner.component";
import LoadOptions from "../components/load-options.components";
import NoDataMessage from "../components/blog-nodata.component";

import useUserFetch from "../fetchs/user.fetch";
import useBlogFetch from "../fetchs/blog.fetch";

import useCollapseStore from "../states/collapse.state";
import useAuthStore from "../states/user-auth.state";
import useHomeBlogStore from "../states/home-blog.state";
import useAuthorProfileStore from "../states/author-profile.state";

import {
  AuthorProfileStructureType,
  type BlogStructureType,
} from "../commons/types.common";

const ProfilePage = () => {
  const { authorId: paramsAuthor } = useParams();
  const { authorProfileInfo } = useAuthorProfileStore();
  const { searchBarVisibility } = useCollapseStore();
  const { authUser } = useAuthStore();
  const { latestBlogs, loadBlogsLimit, setLatestBlogs } = useHomeBlogStore();

  const { GetAuthorProfileInfo } = useUserFetch();
  const { GetLatestBlogsByAuthor } = useBlogFetch();

  const {
    personal_info: { username: profile_username, fullname, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    createdAt,
  } = authorProfileInfo as AuthorProfileStructureType;

  // Fetch author profile info
  useEffect(() => {
    if (paramsAuthor) {
      GetAuthorProfileInfo(paramsAuthor);
    }
  }, [paramsAuthor]);

  // Fetch latest blogs by author
  useEffect(() => {
    if (authorProfileInfo?._id) {
      GetLatestBlogsByAuthor({ authorId: authorProfileInfo._id, page: 1 });
    }

    return () => {
      setLatestBlogs(null);
    };
  }, [authorProfileInfo]);

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

            {/* Profile fullname */}
            <p className="text-md text-grey-dark/50 capitalize">{fullname}</p>

            {/* Profile total posts && total reads */}
            <p className="text-md text-grey-dark">
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>

            {/* Profile edit button - When the author being searched is the current user */}
            {paramsAuthor === authUser?.username && (
              <div className="flex gap-4 mt-2">
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              </div>
            )}

            <hr className="my-2 text-grey-custom" />

            {/* Profile info */}
            <AuthProfileInfo
              bio={bio}
              social_links={social_links}
              createdAt={createdAt}
              className="max-md:hidden"
            />
          </div>

          {/* latest blogs(min-screen && md-screen) && author profile info(min-screen) */}
          <div className="max-md:mt-12 w-full">
            <InpageNavigation
              routes={["Blogs Published", "About"]}
              defaultHiddenIndex={1}
            >
              {/* latest blogs */}
              <>
                {latestBlogs === null ? (
                  <Loader />
                ) : "results" in latestBlogs && latestBlogs?.results?.length ? (
                  <div>
                    {latestBlogs?.results?.map((blog: BlogStructureType, i) => (
                      <AnimationWrapper
                        key={blog.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <BlogPostCard
                          author={blog.author?.personal_info ?? {}}
                          content={blog}
                        />
                      </AnimationWrapper>
                    ))}

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
