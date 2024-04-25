import { GenerateBlogStructureType } from '../../../backend/src/utils/types.util';
import useBlogFetch from '../fetchs/blog.fetch';
import useHomeBlogStore from '../states/home-blog.state';

interface LoadLessBtnProps {
  data: GenerateBlogStructureType;
  target?: string;
  state?: string;
  query?: string;
}

const LoadLessBtn: React.FC<LoadLessBtnProps> = ({
  data,
  target,
  state = 'loadless',
  query,
}) => {
  const {
    inPageNavState: category,
    inPageNavIndex,
    loadBlogsLimit,
  } = useHomeBlogStore();
  const {
    GetLatestBlogs,
    GetLatestBlogsByCategory,
    GetLatestBlogsByQuery,
    GetTrendingBlogs,
  } = useBlogFetch();

  if (data.results.length > loadBlogsLimit) {
    // 這裡有五種情況
    // 1. inPageNavIndex 有值，表示在當前在 min-screen 狀態中的 trending blogs 頁簽，呼叫 GetTrendingBlogs 作為 LoadLessFunction
    // 2. 如果是 target 有值，表示當前在 middle-screen 狀態中的 trending blogs 中，也呼叫 GetTrendingBlogs 作為 LoadLessFunction
    // 3. 如果都不是但 query 有值，表示當前在 search page 中，呼叫 GetLatestBlogsByQuery 作為 LoadLessFunction
    // 4. 如果都不是但 category 是 home，表示當前在 home 頁簽中，呼叫 GetLatestBlogs 作為 LoadLessFunction
    // 5. 如果都不是，表示當前在特定 tag 頁面中，呼叫 GetLatestBlogsByCategory 作為 LoadLessFunction
    const LoadLessFunction =
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
          LoadLessFunction({ category, query, page: data.page, state })
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
        <p className="text-nowrap">Load less</p>
      </div>
    );
  }
};

export default LoadLessBtn;
