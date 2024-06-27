import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { FlatIcons } from "../icons/flaticons";

import { getFullDay } from "../commons/date.common";
import type { AuthorProfileStructureType } from "../commons/types.common";

interface AuthorProfileInfoProps {
  bio: string;
  social_links: AuthorProfileStructureType["social_links"];
  createdAt: string;
  className?: string;
}

const AuthProfileInfo: React.FC<AuthorProfileInfoProps> = ({
  bio,
  social_links,
  createdAt,
  className,
}) => {
  return (
    <div className={twMerge(`md:w-[90%]`, className)}>
      {/* Bio */}
      <p
        className={`
          text-md
          leading-7
          ${
            !bio.length
              ? "text-grey-dark/50"
              : `
                  p-5
                  border-l-4
                  border-orange-200
                  bg-orange-100/30
                  text-orange-900
                  whitespace-pre-wrap
                  rounded-md
                `
          }
        `}
      >
        {bio.length ? bio : "Nothing to read here"}
      </p>

      {/* Social links */}
      <div
        className={`
          ${
            Object.values(social_links).some((link) => link !== "")
              ? `
                  flex
                  flex-wrap
                  my-7
                  gap-y-2 
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
                        ? "hover:text-github"
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

      {/* Joined date */}
      <p className="text-md leading-7 text-grey-dark/40">
        Joined on {getFullDay(createdAt)}
      </p>
    </div>
  );
};

export default AuthProfileInfo;
