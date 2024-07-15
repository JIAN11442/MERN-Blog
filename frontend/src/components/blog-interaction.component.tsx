import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../states/user-auth.state";
import useTargetBlogStore from "../states/target-blog.state";
import useBlogLikedStore from "../states/blog-liked.state";

import { FlatIcons } from "../icons/flaticons";
import useLikedFetch from "../fetchs/liked.fetch";

import type {
  AuthorStructureType,
  BlogStructureType,
} from "../commons/types.common";
import useBlogCommentStore from "../states/blog-comment.state";

const BlogInteraction = () => {
  const { authUser } = useAuthStore();
  const { targetBlogInfo, setTargetBlogInfo } = useTargetBlogStore();
  const { isLikedByUser, setIsLikedByUser } = useBlogLikedStore();
  const { commentsWrapper, setCommentsWrapper } = useBlogCommentStore();
  const {
    _id,
    title,
    blog_id,
    activity,
    activity: { total_likes, total_comments },
    author,
  } = targetBlogInfo as Required<BlogStructureType>;
  const {
    personal_info: { username: author_username },
  } = author as AuthorStructureType;

  const { GetLikeStatusOfBlog, UpdateLikeStatusOfBlog } = useLikedFetch();

  // Switch isLikedByUser state
  const handleLike = () => {
    // 如果已登入，執行按讚
    if (authUser?.access_token) {
      setIsLikedByUser(!isLikedByUser);

      // 因爲 isLikedByUser 是異步，所以 setIsLikedByUser 之後，并不能馬上拿到最新的 isLikedByUser
      // 因此這裏直接取反，不用等待 setIsLikedByUser 更新

      const newTotalLikes = !isLikedByUser
        ? (total_likes ?? 0) + 1
        : (total_likes ?? 0) - 1;

      setTargetBlogInfo({
        ...targetBlogInfo,
        activity: { ...activity, total_likes: newTotalLikes },
      });

      UpdateLikeStatusOfBlog({
        blogObjId: _id,
        isLikedByUser: !isLikedByUser,
      });
    } else {
      // 如果還沒登入，當然就不能按讚
      // 因為之後需要用戶資料記錄是哪位用戶按讚
      toast.error("Please login first to like this blog");
    }
  };

  const handleComment = () => {
    setCommentsWrapper(!commentsWrapper);
  };

  // Get Like Status of Blog from beginning
  useEffect(() => {
    if (authUser?.access_token) {
      GetLikeStatusOfBlog({ blogObjId: _id });
    }
  }, [_id]);

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
              onClick={handleLike}
              className={`
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                shadow-[0px_0px_5px_1px]
                shadow-white-custom
                hover:shadow-grey-dark/20
                transition
                ${
                  isLikedByUser
                    ? `
                        bg-red-custom/20
                        text-red-custom
                      `
                    : `
                        bg-grey-custom/80
                        hover:shadow-grey-dark/20
                        hover:-rotate-90
                      `
                }
              `}
            >
              <FlatIcons
                name={`fi fi-${isLikedByUser ? "sr" : "rr"}-heart`}
                className="flex"
              />
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
              onClick={handleComment}
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                bg-grey-custom/80
                shadow-[0px_0px_5px_1px]
                shadow-white-custom
                hover:shadow-grey-dark/20
                hover:rotate-90
                transition
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
