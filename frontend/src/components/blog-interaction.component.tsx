import { Link } from "react-router-dom";
import type { BlogStructureType } from "../../../backend/src/utils/types.util";
import { FlatIcons } from "../icons/flaticons";
import useTargetBlogStore from "../states/target-blog.state";
import useAuthStore from "../states/user-auth.state";

const BlogInteraction = () => {
  const { targetBlogInfo } = useTargetBlogStore();
  const { authUser } = useAuthStore();
  const {
    title,
    blog_id,
    activity,
    activity: { total_likes, total_comments },
    author: {
      personal_info: { username: author_username },
    },
  } = targetBlogInfo as Required<BlogStructureType>;

  return (
    <>
      {/* Separate Line for top */}
      <hr className="border-grey-custom my-3" />

      {/* Content */}
      <div
        className="
          flex
          gap-6
          items-center
          justify-between
        "
      >
        {/* Likes && Comment */}
        <div
          className="
            flex
            gap-4
            items-start
          "
        >
          {/* Likes Button */}
          <div
            className="
              flex 
              gap-3 
              items-center
            "
          >
            <button
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                bg-grey-custom/80      
              "
            >
              <FlatIcons name="fi fi-rr-heart" />
            </button>
            <p>{total_likes}</p>
          </div>

          {/* Comment Button */}
          <div
            className="
              flex 
              gap-3 
              items-center
            "
          >
            <button
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                bg-grey-custom/80      
              "
            >
              <FlatIcons name="fi fi-rr-comment-dots" />
            </button>
            <p>{total_comments}</p>
          </div>
        </div>

        {/* Edit Link && Share Link */}
        <div
          className="
            flex
            gap-4
          "
        >
          {/* edit link */}
          {author_username === authUser?.username && (
            <Link
              to={`/editor/${blog_id}`}
              className="
                underline
                underline-offset-2
                hover:text-purple-custom
              "
            >
              Edit
            </Link>
          )}

          {/* twitter share link */}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read${title}&url=${location.href}`}
            target="_blank"
          >
            <FlatIcons
              name="fi fi-brands-twitter"
              className="text-xl hover:text-twitter transition"
            />
          </Link>

          {/* facebook share link */}
          <Link
            to={`https://www.facebook.com/sharer/sharer.php?u=${location.href}`}
            target="_blank"
          >
            <FlatIcons
              name="fi fi-brands-facebook"
              className="text-xl hover:text-facebook transition"
            />
          </Link>
        </div>
      </div>

      {/* Separate Line for bottom */}
      <hr className="border-grey-custom my-3" />
    </>
  );
};

export default BlogInteraction;

// https://stackoverflow.com/questions/16463030/how-to-add-facebook-share-button-on-my-website
