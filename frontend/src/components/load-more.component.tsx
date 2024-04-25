import type { GenerateBlogStructureType } from '../../../backend/src/utils/types.util';
import useBlogFetch from '../fetchs/blog.fetch';
import useHomeBlogStore from '../states/home-blog.state';

interface LoadMoreBtnProps {
  data: GenerateBlogStructureType;
  target?: string;
  state?: string;
  query?: string;
}

const LoadMoreBtn: React.FC<LoadMoreBtnProps> = ({
  data,
  target,
  state = 'loadmore',
  query,
}) => {
  const { inPageNavState: category, inPageNavIndex } = useHomeBlogStore();
  const {
    GetLatestBlogs,
    GetLatestBlogsByCategory,
    GetLatestBlogsByQuery,
    GetTrendingBlogs,
  } = useBlogFetch();

  if (data.results.length < data.totalDocs) {
    // 這裡有五種情況
    // 1. inPageNavIndex 有值，表示在當前在 min-screen 狀態中的 trending blogs 頁簽，呼叫 GetTrendingBlogs 作為 LoadMoreFunction
    // 2. 如果是 target 有值，表示當前在 middle-screen 狀態中的 trending blogs 中，也呼叫 GetTrendingBlogs 作為 LoadMoreFunction
    // 3. 如果都不是但 query 有值，表示當前在 search page 中，呼叫 GetLatestBlogsByQuery 作為 LoadMoreFunction
    // 4. 如果都不是但 category 是 home，表示當前在 home 頁簽中，呼叫 GetLatestBlogs 作為 LoadMoreFunction
    // 5. 如果都不是，表示當前在特定 tag 頁面中，呼叫 GetLatestBlogsByCategory 作為 LoadMoreFunction
    const LoadMoreFunction =
      inPageNavIndex || target === 'trendingBlogs'
        ? GetTrendingBlogs
        : query
        ? GetLatestBlogsByQuery
        : category === 'home'
        ? GetLatestBlogs
        : GetLatestBlogsByCategory;

    return (
      <div
        onClick={() =>
          LoadMoreFunction({ category, query, page: data.page + 1, state })
        }
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
        {/* <p>· Load more ·</p> */}
        <p className="text-nowrap">Load more</p>
      </div>
    );
  }
};

export default LoadMoreBtn;
