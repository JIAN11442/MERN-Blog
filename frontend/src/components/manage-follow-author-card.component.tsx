import { Link } from "react-router-dom";
import {
  FollowAuthorsPropsType,
  PersonalInfoStructureType,
} from "../commons/types.common";
import useProviderStore from "../states/provider.state";
import useUserFetch from "../fetchs/user.fetch";
import useAuthStore from "../states/user-auth.state";
import { twMerge } from "tailwind-merge";

interface ManageFollowAuthorCardProps {
  index: number;
  data: FollowAuthorsPropsType;
  state: string;
  for_profile?: boolean;
  for_page?: boolean;
  totalLoadNum?: number;
  btnStyle?: string;
}

const ManageFollowAuthorCard: React.FC<ManageFollowAuthorCardProps> = ({
  index,
  data,
  state,
  for_profile = false,
  for_page = true,
  totalLoadNum = 0,
  btnStyle,
}) => {
  const { personal_info, isFollowing } = data;
  const { fullname, username, profile_img } =
    (personal_info as PersonalInfoStructureType) ?? {};
  const { authUser } = useAuthStore();
  const { username: authUsername } =
    (authUser as PersonalInfoStructureType) ?? {};

  const { theme } = useProviderStore();

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
        for_page,
      });
    } else {
      FollowAuthorByUsername({
        authorUsername: username,
        submitBtn_e: e,
        followAuthorCardIndex: index,
        for_page,
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
            : "p-5"
        }
        gap-5
        items-center
        justify-start
        border-b
        border-grey-custom
        ${for_profile && index !== totalLoadNum ? "border-none" : ""}
        
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
                    w-12
                    h-12
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
            ${theme === "dark" ? "text-grey-dark/50" : "text-grey-dark/60"}
            truncate
            ${for_profile ? "text-[13px]" : ""}
          `}
        >
          @{username}
        </p>
      </div>

      {/* Button */}
      <>
        {username !== authUsername ? (
          <button
            onClick={(e) => handleFollowOrUnfollow(e)}
            className={twMerge(
              `
              ${for_profile ? "hidden" : "flex"}
              ml-auto
              btn-dark
              text-[13px]
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
              
            `,
              btnStyle
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          ""
        )}
      </>
    </div>
  );
};

export default ManageFollowAuthorCard;
