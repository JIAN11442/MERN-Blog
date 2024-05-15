import { getDay } from "../commons/date.common";
import type {
  AuthorProfileStructureType,
  GenerateCommentStructureType,
} from "../commons/types.common";

interface BlogCommentCardProps {
  index: number;
  commentData: GenerateCommentStructureType;
  leftVal: number;
}

const BlogCommentCard: React.FC<BlogCommentCardProps> = ({
  index,
  commentData: { comment, commented_by, commentedAt },
  leftVal,
}) => {
  const {
    personal_info: { username, fullname, profile_img },
  } = commented_by as AuthorProfileStructureType;

  return (
    <div
      className={`
        w-full
        pl-[${leftVal * 10}px]
      `}
    >
      <div
        className="
          my-5
          p-6
          rounded-md
          border
          border-grey-custom
        "
      >
        {/* Comment user info */}
        <div
          className="
            flex
            gap-5
            items-center
            justify-between
            mb-8
          "
        >
          {/* Avatar && Fullname */}
          <div
            className="
              flex 
              w-[80%]
              gap-3
              items-center
            "
          >
            <img
              src={profile_img}
              className="
                w-8
                h-8 
                rounded-full
              "
            />

            <p className="truncate">
              <span>{fullname} </span>
              <span>·</span>
              <span className="text-blue-500"> @{username}</span>
            </p>
          </div>

          {/* Date */}
          <p
            className="
              text-nowrap
              text-grey-dark/60
            "
          >
            {getDay(commentedAt ?? "")}
          </p>
        </div>

        {/* Comment content - whitespace-pre-wrap 可以保留文本換行符 */}
        <p
          className="
            ml-3
            text-lg
            font-gelasio
            whitespace-pre-wrap
          "
        >
          {comment}
        </p>
      </div>
    </div>
  );
};

export default BlogCommentCard;
