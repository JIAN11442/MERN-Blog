import { twMerge } from 'tailwind-merge';

import LoadLessBtn from './load-less.component';
import LoadMoreBtn from './load-more.component';
import BackToTopBtn from './back-top.component';

import { GenerateStructureType } from '../../../backend/src/utils/types.util';

interface LoadOptionsProps {
  id: string;
  data: GenerateStructureType;
  loadLimit: number;
  query?: string;
  loadFunction: ({
    page,
    state,
  }: {
    page?: number;
    state?: string;
  }) => Promise<void>;
  className?: string;
}

const LoadOptions: React.FC<LoadOptionsProps> = ({
  id,
  data,
  loadLimit,
  query,
  loadFunction,
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
      <LoadMoreBtn data={data} query={query} loadFunction={loadFunction} />

      {/* Load less button */}
      <LoadLessBtn
        data={data}
        query={query}
        loadLimit={loadLimit}
        loadFunction={loadFunction}
      />

      {/* Move to top */}
      <BackToTopBtn />
    </div>
  );
};

export default LoadOptions;
