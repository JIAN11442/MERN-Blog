import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import ManageFollowAuthorCardList from "./manage-follow-author-card-list.component";

import { FlatIcons } from "../icons/flaticons";

import useProviderStore from "../states/provider.state";
import useDashboardStore from "../states/dashboard.state";
import useAuthorProfileStore from "../states/author-profile.state";

import { getFullDay } from "../commons/date.common";
import type {
  AuthorProfileStructureType,
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
  const { followState, setFollowState } = useAuthorProfileStore();
  const {
    followingAuthorByLimit,
    setFollowingAuthorByLimit,
    setAllFollowingAuthor,
  } = useDashboardStore();

  const showSeeAllButton =
    followingAuthorByLimit &&
    "results" in followingAuthorByLimit &&
    followingAuthorByLimit.results &&
    followingAuthorByLimit.results.length < followingAuthorByLimit.totalDocs;

  // 呼叫 following tab
  const handleActiveFollowingTab = () => {
    if (followState && setFollowState) {
      setFollowState({ ...followState, active: true, state: "Following" });
    }

    setFollowingAuthorByLimit(null);
    setAllFollowingAuthor(null);
  };

  return (
    <div
      className={twMerge(
        `
          max-md:w-[95%] 
          h-full
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

          {/* Following Card */}
          <ManageFollowAuthorCardList
            data={followingAuthorByLimit as GenerateToLoadStructureType}
            for_fetch="following"
            for_page={false}
            for_profile={true}
          />

          {/* See all button */}
          <>
            {showSeeAllButton && (
              <button
                onClick={handleActiveFollowingTab}
                className="
                  flex
                  pt-2
                  pb-5
                  text-[13px]
                  text-grey-dark/60
                  hover:text-grey-dark/80
                  transition
                "
              >
                See all (
                {
                  (followingAuthorByLimit as GenerateToLoadStructureType)
                    .totalDocs
                }
                )
              </button>
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
                    mt-16
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
