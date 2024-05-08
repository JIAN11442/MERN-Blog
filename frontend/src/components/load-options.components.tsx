import { twMerge } from 'tailwind-merge';

import LoadLessBtn from './load-less.component';
import LoadMoreBtn from './load-more.component';
import HandyToolsBtn from './handy-tool.component';

import {
  GenerateStructureType,
  type FunctionPropsType,
} from '../../../backend/src/utils/types.util';

interface LoadOptionsProps {
  id: string;
  data: GenerateStructureType;
  loadLimit: number;
  query?: string;
  authorId?: string;
  loadFunction: ({ page, state, authorId }: FunctionPropsType) => Promise<void>;
  className?: string;
}

const LoadOptions: React.FC<LoadOptionsProps> = ({
  id,
  data,
  loadLimit,
  query,
  authorId,
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
      <LoadMoreBtn
        data={data}
        query={query}
        authorId={authorId}
        loadFunction={loadFunction}
      />

      {/* Load less button */}
      <LoadLessBtn
        data={data}
        query={query}
        authorId={authorId}
        loadLimit={loadLimit}
        loadFunction={loadFunction}
      />

      {/* Scroll to top */}
      <HandyToolsBtn name="BackToTop" type="textBtn" />
    </div>
  );
};

export default LoadOptions;
