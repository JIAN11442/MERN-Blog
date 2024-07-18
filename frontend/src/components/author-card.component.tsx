import { Link } from "react-router-dom";
import type { AuthorStructureType } from "../commons/types.common";
import useProviderStore from "../states/provider.state";

interface UserCardProps {
  user: AuthorStructureType;
}

const AuthorCard: React.FC<UserCardProps> = ({ user }) => {
  const { username, fullname, profile_img } = user.personal_info;

  const { theme } = useProviderStore();

  return (
    <Link
      to={`/user/${username}`}
      className="
        flex
        gap-5
        items-center
        pb-5
        mb-5
        border-b
        border-grey-custom
      "
    >
      {/* Avatar */}
      <img src={profile_img} className="w-14 h-14 rounded-full" />

      {/* Fullname && Username */}
      <div>
        <h1 className="font-medium text-xl line-clamp-2">{fullname}</h1>
        <p
          className={`
            ${theme === "dark" ? "text-grey-dark/50" : "text-grey-dark/60"}
            `}
        >
          @{username}
        </p>
      </div>
    </Link>
  );
};

export default AuthorCard;
