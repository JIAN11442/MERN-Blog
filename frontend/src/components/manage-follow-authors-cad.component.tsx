import { Link } from "react-router-dom";
import {
  FollowAuthorsPropsType,
  GenerateToLoadStructureType,
  PersonalInfoStructureType,
} from "../commons/types.common";
import useProviderStore from "../states/provider.state";
import useUserFetch from "../fetchs/user.fetch";
import useDashboardStore from "../states/dashboard.state";

interface ManageFollowAuthorProps {
  index: number;
  data: FollowAuthorsPropsType;
  state: string;
  for_profile?: boolean;
}

const ManageFollowAuthorCard: React.FC<ManageFollowAuthorProps> = ({
  index,
  data,
  state,
  for_profile = false,
}) => {
  const { personal_info, isFollowing } = data;
  const { fullname, username, profile_img } =
    (personal_info as PersonalInfoStructureType) ?? {};

  const { theme } = useProviderStore();
  const { followingAuthor } = useDashboardStore();

  const { FollowAuthorByUsername, UnfollowAuthorByUsername } = useUserFetch();

  const handleFollowOrUnfollow = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === "followers" && isFollowing) {
      return e.preventDefault();
    }

    if (isFollowing) {
      UnfollowAuthorByUsername({
        authorUsername: username,
        submitBtn_e: e,
        followAuthorCardIndex: index,
      });
    } else {
      FollowAuthorByUsername({
        authorUsername: username,
        submitBtn_e: e,
        followAuthorCardIndex: index,
      });
    }
  };

  return (
    <div
      className={`
        flex
        ${
          for_profile
            ? `
                p-3 
                pl-0
              `
            : "p-6"
        }
        gap-5
        items-center
        justify-start
        ${
          for_profile &&
          index !==
            ((followingAuthor as GenerateToLoadStructureType).results?.length ??
              0) -
              1
            ? "border-none"
            : ""
        }
        border-b
        border-grey-custom
        
        `}
    >
      {/* Avatar */}
      <Link
        to={`/user/${username}`}
        className="
          flex-none
          hover:opacity-80
          transition
        "
      >
        <img
          src={profile_img}
          className={`
            flex-none
            ${
              for_profile
                ? `
                    w-10
                    h-10
                  `
                : `
                    w-14
                    h-14
                  `
            }
            rounded-full
            object-cover
            shadow-[0px_0px_5px_1px]
            shadow-grey-dark/20
          `}
        />
      </Link>

      {/* Author Fullname && Username */}
      <div>
        <Link
          to={`/user/${username}`}
          className={`
            hover:text-blue-500
            hover:underline
            transition
          `}
        >
          {fullname}
        </Link>
        <p
          className={`
            text-grey-dark/50 
            truncate
            ${for_profile ? "text-[13px]" : ""}
          `}
        >
          @{username}
        </p>
      </div>

      {/* Button */}
      <button
        onClick={(e) => handleFollowOrUnfollow(e)}
        className={`
          ${for_profile ? "hidden" : "flex"}
          ml-auto
          btn-dark
          max-md:rounded-md
          text-black-custom
          ${
            state === "followers" && isFollowing
              ? `
                  cursor-not-allowed
                  hover:opacity-100
                `
              : ""
          }
          ${
            isFollowing
              ? `
                  bg-grey-custom 
                `
              : theme === "dark"
              ? `
                  bg-[#1DA1F2]
                  transition
                `
              : "text-white-custom"
          }
          
        `}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default ManageFollowAuthorCard;
