import { twMerge } from "tailwind-merge";
import { GenerateBlogStructureType } from "../../../backend/src/utils/types.util";
import LoadLessBtn from "./load-less.component";
import LoadMoreBtn from "./load-more.component";

interface LoadOptionsProps {
  data: GenerateBlogStructureType;
  target?: string;
  loadBlogsLimit: number;
  className?: string;
}

const LoadOptions: React.FC<LoadOptionsProps> = ({
  data,
  target,
  loadBlogsLimit,
  className,
}) => {
  return (
    <div
      className={twMerge(
        `
          flex
          gap-2
        `,
        className
      )}
    >
      {/* Load more button */}
      <LoadMoreBtn data={data} target="trendingBlogs" />

      {/* Load less button */}
      {data.results.length > loadBlogsLimit && (
        <LoadLessBtn
          data={data}
          loadBlogsLimit={loadBlogsLimit}
          target={target}
        />
      )}
    </div>
  );
};

export default LoadOptions;
