import { Link } from 'react-router-dom';
import type {
  AuthorStructureType,
  BlogStructureType,
} from '../../../backend/src/utils/types.util';

import { getDate } from '../commons/date.common';
import { FlatIcons } from '../icons/flaticons';

interface BlogPostCardProps {
  author: AuthorStructureType;
  content: BlogStructureType;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ author, content }) => {
  const { fullname, username, profile_img } = author;
  const {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes },
    blog_id: id,
  } = content;

  return (
    <Link
      to={`/blog/${id}`}
      className="
        flex
        gap-10
        items-center
        border-b
        border-grey-custom
        pb-5
        mb-4
      "
    >
      {/* Left side blog information */}
      <div className="w-full min-w-[200px]">
        {/* Blog Author */}
        <div className="flex items-center gap-3 mb-7">
          {/* author image */}
          <img src={profile_img} className="w-8 h-8 rounded-full" />
          {/* author fullname && username*/}
          <p className="flex gap-x-1">
            <span>{fullname}</span>
            <span className="hidden md:flex gap-x-1">
              <span>·</span>
              <span>@{username}</span>
            </span>
          </p>
          {/* blog post date */}
          <p className="min-w-fit text-grey-dark/60 ml-2">
            {getDate(publishedAt!)}
          </p>
        </div>

        {/* Blog Title && Description */}
        <div className=" flex flex-col gap-y-3">
          {/* Title */}
          <h1 className="blog-title">{title}</h1>

          {/* Description */}
          <p
            className="
              text-[17px]
              font-gelasio
              leading-8
              line-clamp-2
              max-sm:hidden
              transition
            "
          >
            {des}
          </p>
        </div>

        {/* Tags && Like*/}
        <div className="flex gap-4 mt-7">
          <span className="btn-light py-1.5 px-4 truncate">
            {tags && tags[0]}
          </span>
          <span className="flex ml-2 items-center gap-2 text-grey-dark">
            <FlatIcons name="fi fi-rr-heart" className="text-xl" />
            {total_likes}
          </span>
        </div>
      </div>

      {/* Right side blog banner */}
      <div className="h-[8rem] aspect-square bg-grey-custom">
        <img src={banner} className="w-full h-full object-cover" />
      </div>
    </Link>
  );
};

export default BlogPostCard;
