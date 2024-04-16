import type { GenerateBlogStructureType } from '../../../backend/src/utils/types.util';
import useBlogFetch from '../fetchs/blog.fetch';
import useHomeBlogStore from '../states/home-blog.state';

interface LoadMoreBtnProps {
  data: GenerateBlogStructureType;
}

const LoadMoreBtn: React.FC<LoadMoreBtnProps> = ({ data }) => {
  const { inPageNavState: category } = useHomeBlogStore();
  const { GetLatestBlogs, GetLatestBlogsByCategory } = useBlogFetch();

  if (data.results.length < data.totalDocs) {
    // 判斷 state 是否為 home，如果是則呼叫 GetLatestBlogs，否則呼叫 GetLatestBlogsByCategory
    const LoadMoreFunction =
      category === 'home' ? GetLatestBlogs : GetLatestBlogsByCategory;

    return (
      <div
        onClick={() => LoadMoreFunction({ category, page: data.page + 1 })}
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
        <p>· Load more ·</p>
      </div>
    );
  }
};

export default LoadMoreBtn;
