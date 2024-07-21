import { useNavigate } from "react-router-dom";

import useProviderStore from "../states/provider.state";

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
  const { fullname, username, profile_img } =
    (author as AuthorStructureType)?.personal_info || {};

  const navigate = useNavigate();

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
        group
        flex
        gap-5
        p-5
        pl-0
        hover:pl-5
        cursor-pointer
         ${
           theme === "light"
             ? "hover:bg-grey-custom/40"
             : "hover:bg-grey-custom/80"
         }
      `}
    >
      {/* Index */}
      <h1
        className={`
          blog-index 
          ${
            theme === "light"
              ? "group-hover:text-grey-dark/30"
              : "group-hover:text-grey-dark/40"
          }
        `}
      >
        {index < 10 - 1 ? "0" + (index + 1) : index + 1}
      </h1>

      <div>
        {/* Blog Author */}
        <div className="flex items-center gap-3 mb-7">
          {/* author image */}
          <img
            onClick={handleNavigateToProfile}
            src={profile_img}
            className="
              w-8 
              h-8 
              hover:opacity-80
              rounded-full
            "
          />

          {/* author fullname && username*/}
          <p className="flex gap-x-1 text-nowrap">
            <span>{fullname}</span>
          </p>

          {/* blog post date */}
          <p className="min-w-fit text-grey-dark/60 ">
            {getTimeAgo(publishedAt!)}
          </p>
        </div>

        {/* Blog Title */}
        <h1 className="blog-title">{title}</h1>
      </div>
    </div>
  );
};

export default MinimalBlogPostCard;
