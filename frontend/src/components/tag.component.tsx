import toast from 'react-hot-toast';
import { FlatIcons } from '../icons/flaticons';

import useEditorBlogStore from '../states/editor-blog.state';

interface TagProps {
  tag: string;
  index: number;
}

const Tag: React.FC<TagProps> = ({ tag, index }) => {
  const { isTagEdit, setIsTagEdit, blog, setBlog } = useEditorBlogStore();

  const handleTagDelete = () => {
    const tags = blog.tags?.filter((t) => t !== tag);
    setBlog({ ...blog, tags });
  };
  const handleTagOnKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };
  const handleTagOnBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const currentTag = e.target.textContent;

    if (currentTag) {
      if (blog.tags) {
        blog.tags[index] = currentTag;
        setBlog({ ...blog, tags: [...blog.tags] });
      }
    } else {
      // Warning the user if the tag is empty
      setIsTagEdit({ state: true, index: index });
      e.currentTarget.focus();

      return toast.error('Tag cannot be empty!');
    }
    setIsTagEdit({ state: false, index: null });
  };

  return (
    <div
      className={`
        relative
        group
        p-2
        mt-2
        mr-2
        bg-white-custom
        rounded-full
        inline-block
        hover:bg-opacity-50
        transition
        ${
          isTagEdit.state
            ? isTagEdit.index === index &&
              `
                shadow-[0px_0px_10px_2px_rgba(0,0,0,0)]
                shadow-purple-custom/30
              `
            : `
                shadow-[0px_0px_10px_2px_rgba(0,0,0,0)]
                shadow-grey-dark/20
              `
        }
      `}
    >
      <p
        className="px-3 outline-none"
        contentEditable="true"
        suppressContentEditableWarning={true}
        onFocus={() => setIsTagEdit({ state: true, index: index })}
        onKeyDown={(e) => handleTagOnKeyDown(e)}
        onBlur={(e) => handleTagOnBlur(e)}
      >
        {tag}
      </p>

      <button
        onClick={handleTagDelete}
        className={`
          absolute
          -top-2
          right-0
          hidden
          ${!isTagEdit.state && 'group-hover:block'}
        `}
      >
        <FlatIcons
          name="fi fi-ss-circle-xmark"
          size="text-lg"
          className="pointer-events-none"
        />
      </button>
    </div>
  );
};

export default Tag;
