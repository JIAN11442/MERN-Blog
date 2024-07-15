import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import Loader from "./loader.component";
import AnimationWrapper from "./page-animation.component";
import ManageFollowAuthorCard from "./manage-follow-authors-cad.component";
import NoDataMessage from "./blog-nodata.component";

import { FlatIcons } from "../icons/flaticons";

import useProviderStore from "../states/provider.state";
import useDashboardStore from "../states/dashboard.state";

import { getFullDay } from "../commons/date.common";
import type {
  AuthorProfileStructureType,
  FollowAuthorsPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface AuthorProfileInfoProps {
  bio: string;
  social_links: AuthorProfileStructureType["social_links"];
  createdAt: string;
  for_profile?: boolean;
  className?: string;
}

const AuthProfileInfo: React.FC<AuthorProfileInfoProps> = ({
  bio,
  social_links,
  createdAt,
  for_profile = false,
  className,
}) => {
  const { theme } = useProviderStore();
  const { followingAuthor } = useDashboardStore();

  return (
    <div
      className={twMerge(
        `
          max-md:w-[95%] 
          h-full
          -mb-10
          flex
          flex-col
          justify-between
        `,
        className
      )}
    >
      {/* Following && Bio */}
      <div>
        {/* Following */}
        <div
          className="
              max-md:hidden
              flex
              flex-col
              max-w-[90%]
            "
        >
          {/* Title */}
          <h1 className="text-xl font-medium pb-2">Following</h1>

          {/* Following Content */}
          <>
            {followingAuthor === null ? (
              <Loader />
            ) : followingAuthor &&
              "results" in followingAuthor &&
              followingAuthor.results &&
              (followingAuthor.results?.length ?? 0) > 0 ? (
              <div>
                {/* Following Card */}
                <>
                  {followingAuthor.results.map((author, i) => (
                    <AnimationWrapper
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ManageFollowAuthorCard
                        index={i}
                        data={author as FollowAuthorsPropsType}
                        state="following"
                        for_profile={true}
                      />
                    </AnimationWrapper>
                  ))}
                </>

                {/* Load Options */}
                {import.meta.env.VITE_MANAGE_AUTHORS_LIMIT <
                  followingAuthor.totalDocs && (
                  <button
                    className="
                      flex
                      py-2
                      text-[13px]
                      text-grey-dark/60
                      hover:text-grey-dark/80
                      transition
                    "
                  >
                    See all (
                    {(followingAuthor as GenerateToLoadStructureType).totalDocs}
                    )
                  </button>
                )}
              </div>
            ) : (
              <NoDataMessage message="No following" />
            )}
          </>
        </div>

        {/* Bio */}
        <p
          className={`
            text-md
            leading-7
            md:hidden
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
      </div>

      {/* Social link && Date */}
      <div
        className={`
            ${
              for_profile
                ? `
                    border-t
                    border-grey-custom
                  `
                : ""
            }
        `}
      >
        {/* Social links */}
        <>
          {Object.keys(social_links).length > 0 && (
            <div
              className={`
                ${
                  Object.values(social_links).some((link) => link !== "")
                    ? `
                        flex
                        flex-wrap
                        mt-5
                        mb-3
                        gap-x-7
                        items-center
                        text-grey-dark
                      `
                    : "my-5"
                }
              `}
            >
              {Object.keys(social_links).map((key) => {
                // get the link from the social_links object
                const link = social_links[key as keyof typeof social_links];

                return (
                  link && (
                    <Link key={key} to={link} target="_blank">
                      <FlatIcons
                        name={`${
                          key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                        }`}
                        className={`
                          text-xl
                          text-grey-dark
                          opacity-60
                          hover:opacity-100
                          ${
                            key === "youtube"
                              ? "hover:text-youtube"
                              : key === "facebook"
                              ? "hover:text-facebook"
                              : key === "instagram"
                              ? "hover:text-instagram"
                              : key === "twitter"
                              ? "hover:text-twitter"
                              : key === "github"
                              ? theme === "light"
                                ? "hover:text-github"
                                : "hover:text-black"
                              : "hover:text-website"
                          }
                          transition
                        `}
                      />
                    </Link>
                  )
                );
              })}
            </div>
          )}
        </>

        {/* Joined date */}
        <p
          className="
            text-[13px] 
            text-grey-dark/40
          "
        >
          Joined on {getFullDay(createdAt)}
        </p>
      </div>
    </div>
  );
};

export default AuthProfileInfo;
