import { twMerge } from 'tailwind-merge';
import { GenerateBlogStructureType } from '../../../backend/src/utils/types.util';
import LoadLessBtn from './load-less.component';
import LoadMoreBtn from './load-more.component';
import BackToTopBtn from './back-top.component';

interface LoadOptionsProps {
  id: string;
  data: GenerateBlogStructureType;
  target?: string;
  loadBlogsLimit: number;
  query?: string;
  className?: string;
}

const LoadOptions: React.FC<LoadOptionsProps> = ({
  id,
  data,
  target,
  loadBlogsLimit,
  query,
  className,
}) => {
  return (
    <div
      id={id}
      className={twMerge(
        `
          flex
          gap-2
          items-center
        `,
        className
      )}
    >
      {/* Load more button */}
      <LoadMoreBtn data={data} target={target} query={query} />

      {/* Load less button */}
      {data.results.length > loadBlogsLimit && (
        <LoadLessBtn data={data} target={target} query={query} />
      )}

      {/* Move to top */}
      <BackToTopBtn />
    </div>
  );
};

export default LoadOptions;
