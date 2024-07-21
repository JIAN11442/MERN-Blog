import { useNavigate } from "react-router-dom";

import { FlatIcons } from "../icons/flaticons";
import useProviderStore from "../states/provider.state";

import type {
  BlogStructureType,
  PersonalInfoStructureType,
} from "../commons/types.common";
import { getTimeAgo } from "../commons/date.common";

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
  const navigate = useNavigate();

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

  const { theme } = useProviderStore();

  // 移動到目標作者頁面
  const handleNavigateToProfile = (e: React.MouseEvent<HTMLSpanElement>) => {
    // 阻止事件冒泡，即同時觸發父元素的 onClick 事件
    e.stopPropagation();

    navigate(`/user/${username}`);
  };

  // 移動到目標文章頁面
  const handleNavigateToTargetBlog = () => {
    navigate(`/blog/${id}`);
  };

  return (
    <div
      onClick={handleNavigateToTargetBlog}
      className={`
        ${
          position === "vertical"
            ? `
                flex 
                flex-col-reverse
                justify-start
                md:max-w-[400px]
                max-md:max-w-[450px]
                gap-5
              `
            : `
                flex
                items-center
                gap-10
              `
        }
        p-5
        pl-0
        border-b
        border-grey-custom
        ${
          theme === "light"
            ? "hover:bg-grey-custom/40"
            : "hover:bg-grey-custom/80"
        }
        hover:rounded-md
        hover:pl-5
        cursor-pointer
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
            onClick={handleNavigateToProfile}
            src={profile_img}
            className="
              w-10
              h-10
              rounded-full
              shadow-[0px_0px_5px_1px]
              shadow-grey-dark/10
              hover:shadow-grey-dark/20
              hover:opacity-80
              transition
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
            <span className="capitalize">{fullname}</span>
            <span
              className="
                hidden 
                md:flex 
                gap-x-1 
              "
            >
              <span>·</span>
              <span
                onClick={handleNavigateToProfile}
                className="
                  text-blue-500 
                    hover:underline
                "
              >
                @{username}
              </span>
            </span>
          </p>
          {/* blog post date */}
          <p
            className="
              max-md:flex
              md:hidden
              xl:flex
              min-w-fit 
              text-grey-dark/60
            "
          >
            {getTimeAgo(publishedAt!)}
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
            className={`
              btn-light
              py-1.5 
              px-4
              truncate
              ${theme === "dark" && "bg-grey-dark/10"}
            `}
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
                  h-[10rem] 
                  aspect-square 
                  ml-10
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
            rounded-md
          "
        />
      </div>
    </div>
  );
};

export default BlogPostCard;
