import { GenerateBlogStructureType } from "../../../backend/src/utils/types.util";
import useBlogFetch from "../fetchs/blog.fetch";
import useHomeBlogStore from "../states/home-blog.state";

interface LoadLessBtnProps {
  data: GenerateBlogStructureType;
  target?: string;
  state?: string;
  loadBlogsLimit: number;
}

const LoadLessBtn: React.FC<LoadLessBtnProps> = ({
  data,
  target,
  state = "loadless",
  loadBlogsLimit,
}) => {
  const { inPageNavState: category, inPageNavIndex } = useHomeBlogStore();
  const { GetLatestBlogs, GetLatestBlogsBySearch, GetTrendingBlogs } =
    useBlogFetch();

  if (data.results.length > loadBlogsLimit) {
    // 判斷 state 是否為 home，如果是則呼叫 GetLatestBlogs，否則呼叫 GetLatestBlogsByCategory
    const LoadLessFunction =
      inPageNavIndex || target === "trendingBlogs"
        ? GetTrendingBlogs
        : category === "home"
        ? GetLatestBlogs
        : GetLatestBlogsBySearch;

    return (
      <div
        onClick={() => LoadLessFunction({ category, page: data.page, state })}
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
        <p>Load less</p>
      </div>
    );
  }
};

export default LoadLessBtn;
