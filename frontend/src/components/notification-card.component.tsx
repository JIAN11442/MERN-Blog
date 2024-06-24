import { Link } from "react-router-dom";
import {
  AuthorStructureType,
  NotificationStructureType,
} from "../commons/types.common";

interface NotificationCardProps {
  index: number;
  notification: NotificationStructureType;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  index,
  notification,
}) => {
  const { user } = notification as NotificationStructureType;
  const { fullname, username, profile_img } =
    (user as AuthorStructureType)?.personal_info ?? {};

  return (
    <div
      className="
        p-6
        border-b
        border-grey-custom
        border-l-black-custom
      "
    >
      <div
        className="
          flex
          gap-5
          mb-3
        "
      >
        <img
          src={profile_img}
          className="
            w-12
            h-12
            rounded-full
          "
        />

        <div
          className="
            w-full
          "
        >
          <span
            className="
              hidden
              lg:inline-block
              capitalize
            "
          >
            {fullname}
          </span>
          <Link to={`/user/${username}`} className="text-blue-500">
            @{username}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
