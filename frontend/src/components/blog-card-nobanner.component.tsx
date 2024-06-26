import { Link } from "react-router-dom";
import type {
  AuthorStructureType,
  BlogStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";

interface MinimalBlogPostCardProps {
  blog: BlogStructureType;
  index: number;
}

const MinimalBlogPostCard: React.FC<MinimalBlogPostCardProps> = ({
  blog,
  index,
}) => {
  const { title, publishedAt, blog_id: id, author } = blog;
  const { fullname, profile_img } =
    (author as AuthorStructureType)?.personal_info || {};

  return (
    <Link
      to={`/blog/${id}`}
      className="
        flex
        gap-5
        mb-8
      "
    >
      {/* Index */}
      <h1 className="blog-index">
        {index < 10 - 1 ? "0" + (index + 1) : index + 1}
      </h1>

      <div>
        {/* Blog Author */}
        <div className="flex items-center gap-3 mb-7">
          {/* author image */}
          <img src={profile_img} className="w-8 h-8 rounded-full" />
          {/* author fullname && username*/}
          <p className="flex gap-x-1 text-nowrap">
            <span>{fullname}</span>
            {/* <span>·</span> */}
            {/* <span className="hidden xl:flex gap-x-1 text-blue-500">
              <span>@{username}</span>
            </span> */}
          </p>
          {/* blog post date */}
          <p className="min-w-fit text-grey-dark/60 ">
            {getTimeAgo(publishedAt!)}
          </p>
        </div>

        {/* Blog Title */}
        <h1 className="blog-title">{title}</h1>
      </div>
    </Link>
  );
};

export default MinimalBlogPostCard;
