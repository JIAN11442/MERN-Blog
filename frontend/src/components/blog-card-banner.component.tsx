import { Link } from "react-router-dom";
import type {
  BlogStructureType,
  PersonalInfoStructureType,
} from "../commons/types.common";

import { getDay } from "../commons/date.common";
import { FlatIcons } from "../icons/flaticons";

interface BlogPostCardProps {
  author: PersonalInfoStructureType;
  content: BlogStructureType;
  position?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  author,
  content,
  position = "horizontal",
}) => {
  const { fullname, username, profile_img } = author;
  const {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity,
    blog_id: id,
  } = content;

  return (
    <Link
      to={`/blog/${id}`}
      className={`
        ${
          position === "vertical"
            ? `
                flex 
                flex-col-reverse
                justify-start
                md:max-w-[400px]
                max-md:max-w-[450px]
              `
            : `
                flex
                items-center
              `
        }
        gap-10
        border-b
        border-grey-custom
        pb-5
        mb-4
      `}
    >
      {/* Left side blog information */}
      <div
        className={`
        ${
          position === "vertical"
            ? `w-full`
            : `
                w-full 
                min-w-[200px]
              `
        }
      `}
      >
        {/* Blog Author */}
        <div
          className="
            flex 
            items-center 
            gap-3 
            mb-7
          "
        >
          {/* author image */}
          <img
            src={profile_img}
            className="
              w-8
              h-8
              rounded-full
            "
          />
          {/* author fullname && username*/}
          <p
            className="
              flex 
              gap-x-1 
              text-nowrap
            "
          >
            <span>{fullname}</span>
            <span>·</span>
            <span
              className="
                hidden 
                md:flex 
                gap-x-1 
                text-blue-500
              "
            >
              <span>@{username}</span>
            </span>
          </p>
          {/* blog post date */}
          <p
            className="
              min-w-fit 
              text-grey-dark/60
            "
          >
            {getDay(publishedAt!)}
          </p>
        </div>

        {/* Blog Title && Description */}
        <div
          className=" 
            flex 
            flex-col 
            gap-y-3
          "
        >
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
        <div
          className="
            flex
            gap-4
            mt-7
          "
        >
          {/* Tag */}
          <span
            className="
              btn-light
              py-1.5 
              px-4
              truncate
            "
          >
            {tags && tags[0]}
          </span>

          {/* Liked */}
          <span
            className="
              flex
              ml-2
              items-center
              gap-2
              text-grey-dark
            "
          >
            <FlatIcons name="fi fi-rr-heart" className="text-xl" />
            {activity?.total_likes}
          </span>

          {/* Read */}
          <span
            className="
              flex
              ml-2
              items-center
              gap-2
              text-grey-dark
            "
          >
            <FlatIcons name="fi fi-rr-eye" className="text-xl" />
            {activity?.total_reads}
          </span>
        </div>
      </div>

      {/* Right side blog banner */}
      <div
        className={`
          ${
            position === "vertical"
              ? ` h-[250px]
                  rounded-md
                  overflow-hidden
                `
              : `
                  h-[8rem] 
                  aspect-square 
                `
          }
          bg-grey-custom
      `}
      >
        <img
          src={banner}
          className="
            w-full 
            h-full 
            object-cover
          "
        />
      </div>
    </Link>
  );
};

export default BlogPostCard;
