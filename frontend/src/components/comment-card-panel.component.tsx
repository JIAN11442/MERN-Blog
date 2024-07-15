import AnimationWrapper from "./page-animation.component";

interface CommentCardOptionsPanelProps {
  access_token: string | undefined;
  authUsername: string | undefined;
  commentUsername: string | undefined;
  blogAuthorUsername: string | undefined;
  handleReply: () => void;
  handleEditComment: () => void;
  handleDeleteWarning: () => void;
}

const CommentCardOptionsPanel: React.FC<CommentCardOptionsPanelProps> = ({
  access_token,
  authUsername,
  commentUsername,
  blogAuthorUsername,
  handleReply,
  handleEditComment,
  handleDeleteWarning,
}) => {
  return (
    <AnimationWrapper
      keyValue="options-collapse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="
        absolute
        -top-11
        right-10
        z-20
        shadow-[0px_0px_5px_1px]
        shadow-grey-dark/15
        rounded-lg
      "
    >
      <div
        className="
          border
          bg-white-custom
          border-grey-custom
          duration-200
        "
      >
        {/* Reply button */}
        <button
          onClick={handleReply}
          className="
            flex
            w-full
            py-2
            px-10
            hover:bg-grey-custom/50
            text-grey-dark/60
            hover:text-grey-dark/80
            transition
          "
        >
          Reply
        </button>

        {/* Edit button */}
        <div>
          {(access_token && authUsername === commentUsername) ||
          !access_token ? (
            <button
              onClick={handleEditComment}
              className="
                flex
                w-full
                py-2
                px-10
                hover:bg-grey-custom/50
                text-grey-dark/60
                hover:text-grey-dark/80
                transition
              "
            >
              Edit
            </button>
          ) : (
            ""
          )}
        </div>

        {/* Delete button */}

        {(access_token && authUsername === blogAuthorUsername) ||
        (access_token && authUsername === commentUsername) ||
        !access_token ? (
          <button
            onClick={handleDeleteWarning}
            className="
              flex
              w-full
              py-2
              px-10
              hover:bg-grey-custom/50
              text-grey-dark/60
              hover:text-grey-dark/80
              transition
            "
          >
            Delete
          </button>
        ) : (
          ""
        )}
      </div>
    </AnimationWrapper>
  );
};

export default CommentCardOptionsPanel;
