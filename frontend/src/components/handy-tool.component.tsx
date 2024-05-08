import { twMerge } from 'tailwind-merge';
import useHomeBlogStore from '../states/home-blog.state';
import { FlatIcons } from '../icons/flaticons';

interface HandyToolBtnProps {
  name: string;
  type: string;
  className?: string;
}

const HandyToolBtn: React.FC<HandyToolBtnProps> = ({
  name,
  type,
  className,
}) => {
  const { scrollbarVisible } = useHomeBlogStore();
  const position = scrollbarVisible.position;
  const names = ['BackToTop', 'BackToTopAndBottom'];
  const types = ['textBtn', 'IconBtn'];

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (!scrollbarVisible) return;

  // Back to top button with text
  if (name === names[0] && type === types[0]) {
    return (
      <div
        onClick={handleBackToTop}
        className={twMerge(
          `
            flex
            items-center
            justify-center
            p-3
            mb-10
            text-grey-dark/40
            hover:text-grey-dark/50
            cursor-pointer
            transition
          `,
          className
        )}
      >
        <button className="text-nowrap">Back to top</button>
      </div>
    );
  }

  // Back to top and bottom button with floating action
  if (name === names[1] && type === types[1]) {
    return (
      <div
        className={`
          fixed
          right-5
          ${
            // 當捲軸到底時，將按鈕定位在底部，其他時候則定位在右中
            position + window.innerHeight === document.body.scrollHeight
              ? 'md:bottom-10 max-md:bottom-[7rem]'
              : 'translate-y-1/2 bottom-1/2'
          }
          flex
          flex-col
        `}
      >
        {/* Back to top */}
        <button onClick={handleBackToTop}>
          <FlatIcons
            name="fi fi-sr-angle-circle-up"
            className="
              text-grey-dark/40
              text-[45px]
              opacity-30
              hover:opacity-100
              transition
            "
          />
        </button>

        {/* Back to Bottom */}
        {position + window.innerHeight !== document.body.scrollHeight && (
          <button onClick={handleBackToBottom} className="-mt-3">
            <FlatIcons
              name="fi fi-sr-angle-circle-down"
              className="
                text-grey-dark/40
                text-[45px]
                opacity-30
                hover:opacity-100
                transition
              "
            />
          </button>
        )}
      </div>
    );
  }
};

export default HandyToolBtn;
