import { useEffect, useRef } from "react";
import { FlatIcons } from "../icons/flaticons";
import useBlogCommentStore from "../states/blog-comment.state";

const EditCommentWarningModal = () => {
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const { setEditComment, setIsEditWarning, setCommentsWrapper } =
    useBlogCommentStore();

  const handleDiscard = () => {
    setIsEditWarning(false);
    setCommentsWrapper(false);
    setEditComment({ status: false, data: null });
  };

  const handleCancel = () => {
    setIsEditWarning(false);
  };

  // 出現本組件后
  // 如果點擊的不是警告視窗提供的按鈕選項，那就讓點擊事件失效
  // 這樣 container 就不會被關閉
  // 反之，執行相應的操作
  useEffect(() => {
    if (discardBtnRef.current && cancelBtnRef.current) {
      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          target === discardBtnRef.current ||
          target === cancelBtnRef.current
        ) {
          if (target.innerText === "Discard") {
            handleDiscard();
          } else {
            handleCancel();
          }
        }
      };

      document.addEventListener("mousedown", handleMouseDown);

      return () => {
        document.removeEventListener("mousedown", handleMouseDown);
      };
    }
  }, []);

  return (
    <div
      className="
        fixed
        inset-0
        bg-grey-dark/50
        z-40
      "
    >
      <div
        className="
          absolute
          max-sm:w-[420px]
          sm:min-w-[450px]
          sm:max-w-[650px]
          p-12
          -translate-x-1/2
          -translate-y-1/2
          top-1/2
          left-1/2
          flex
          flex-col
          gap-5
          bg-white-custom
          rounded-md
          transition
        "
      >
        <FlatIcons
          name="fi fi-sr-light-emergency-on"
          className="
            text-5xl
            text-yellow-500/50
            center
          "
        />

        {/* Warning Title */}
        <div className="flex flex-col gap-3">
          {/* Warning Title */}
          <h1
            className="
              text-3xl
              font-medium
              font-sans
              text-grey-dark
              center
            "
          >
            Are you Sure?
          </h1>

          {/* Warning Content */}
          <p
            className="
              my-2
              text-xl
              text-red-custom/80
              line-clamp-2
              center
            "
          >
            Are you sure you want to discard this draft?{" "}
          </p>
        </div>

        {/* Buttons */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-8
          "
        >
          <button
            ref={cancelBtnRef}
            className="
              btn-dark
              px-10
              bg-grey-dark/30
              rounded-md
            "
          >
            Cancel
          </button>

          <button
            ref={discardBtnRef}
            className="
              btn-dark
              px-10
              bg-red-500/80
              rounded-md
            "
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommentWarningModal;
