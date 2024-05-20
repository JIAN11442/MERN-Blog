import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { FlatIcons } from '../icons/flaticons';

import BlogCommentCard from '../components/blog-comment-card.component';

import useBlogCommentStore from '../states/blog-comment.state';

import useCommentFetch from '../fetchs/comment.fetch';
import type { GenerateCommentStructureType } from '../commons/types.common';

interface DeleteCommentWarningProps {
  data: GenerateCommentStructureType;
}

const DeleteCommentWarning: React.FC<DeleteCommentWarningProps> = ({
  data,
}) => {
  const { _id, blog_id } = data;

  const modalRef = useRef<HTMLDivElement | null>(null);

  const { deletedComment, setDeletedComment, setModalRefStore } =
    useBlogCommentStore();
  const { DeleteTargetComment } = useCommentFetch();

  // 取消刪除，關閉刪除警告視窗
  const handleCancel = () => {
    setDeletedComment({ ...deletedComment, state: false });
  };

  // 刪除留言，再關閉刪除警告視窗
  const handleDelete = () => {
    DeleteTargetComment({ commentObjectId: _id, blogObjectId: blog_id });

    setDeletedComment({ ...deletedComment, state: false });

    toast.success('Comment deleted successfully');
  };

  // 當點擊其他非 modalRef 的地方，就關閉刪除警告視窗
  // 之所以用 setTimeout 是為了避免在點擊觸發並渲染本元件的 useEffect 時，
  // document 就已經同步監聽並取得渲染前點擊的那個 html 元素，
  // 這樣會讓 e.target 第一時間就已經有值了，且還不是本元件的 html 元素，導致一開始就關閉刪除警告視窗
  // 而為什麼 setTimeout 延遲時間設定為 0 也能解決同步事件，是因為 setTimeout 會將事件放到事件隊列的最後面，
  // 因此在事件隊列中的其他事件都執行完前，都不會執行 setTimeout 裡的事件
  // 也就是說，它會等點擊觸發並渲染本元件的 useEffect 事件執行完後，再執行 setTimeout 裡的事件
  useEffect(() => {
    const handleOnBlur = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setDeletedComment({ ...deletedComment, state: false });
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOnBlur);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOnBlur);
    };
  }, []);

  // 因為 [警告視窗] 有可能與 [留言視窗] 同時存在，
  // 而為了讓 [留言視窗] 在 onBlur 時自動關閉的功能，不受到 [警告視窗] 的影響，
  // 所以這裡要將 [警告視窗] 的 modalRef 存到全域變數中
  // 且當 [警告視窗] 被卸載時，要將全域變數中的 modalRef 設為 null
  // 這樣就能藉由 modalRef 有值與否，來判斷 [警告視窗] 存不存在
  // 而當 [警告視窗] 存在時，就不會觸發 [留言視窗] 的 onBlur 關閉功能(這一步看 ..comment-container.component)
  useEffect(() => {
    if (modalRef) {
      setModalRefStore(modalRef);
    }

    return () => {
      setModalRefStore({ current: null });
    };
  }, [modalRef]);

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
        ref={modalRef}
        className="
          absolute
          max-sm:min-w-[90%]
          sm:max-w-[600px]
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
        "
      >
        {/* Warning Icon */}
        <FlatIcons
          name="fi fi-tr-trash-xmark"
          className="
            text-8xl
            text-red-500/50
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
              text-xl
              text-grey-dark/50
              center
            "
          >
            Do you really want to delete this comment?
          </p>
        </div>

        {/* Preview */}
        <BlogCommentCard
          index={1}
          commentData={data}
          leftVal={10}
          options={false}
        />

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
            onClick={handleCancel}
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
            onClick={handleDelete}
            className="
              btn-dark
              px-10
              bg-red-500/80
              rounded-md
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCommentWarning;
