import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import type { AuthorProfileStructureType } from '../../../backend/src/utils/types.util';
import { FlatIcons } from '../icons/flaticons';
import { getFullDate } from '../commons/date.common';

interface AuthorProfileInfoProps {
  bio: string;
  social_links: AuthorProfileStructureType['social_links'];
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
      <p className={`text-md leading-7 ${!bio.length && 'text-grey-dark/50'}`}>
        {bio.length ? bio : 'Nothing to read here'}
      </p>

      {/* Social links */}
      <div
        className={`
          ${
            Object.values(social_links).some((link) => link !== '')
              ? `
                  flex
                  flex-wrap
                  my-7
                  gap-y-2 
                  gap-x-7
                  items-center
                  text-grey-dark
                `
              : 'my-5'
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
                    key !== 'website' ? `fi-brands-${key}` : 'fi-rr-globe'
                  }`}
                  className="text-xl hover:text-black-custom transition"
                />
              </Link>
            )
          );
        })}
      </div>

      {/* Joined date */}
      <p className="text-md leading-7 text-grey-dark">
        Joined on {getFullDate(createdAt)}
      </p>
    </div>
  );
};

export default AuthProfileInfo;
