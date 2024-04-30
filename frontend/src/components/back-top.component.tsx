import useHomeBlogStore from '../states/home-blog.state';

const BackToTopBtn = () => {
  const { scrollbarVisible } = useHomeBlogStore();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!scrollbarVisible) return;

  return (
    <div
      onClick={handleBackToTop}
      className="
        flex
        items-center
        justify-center
        p-3
        mb-10
        text-grey-dark/40
        hover:text-grey-dark/50
        cursor-pointer
        transition
      "
    >
      <button className="text-nowrap">Back to top</button>
    </div>
  );
};

export default BackToTopBtn;
