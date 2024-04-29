import useHomeBlogStore from '../states/home-blog.state';

import {
  GenerateStructureType,
  type FunctionPropsType,
} from '../../../backend/src/utils/types.util';

interface LoadLessBtnProps {
  data: GenerateStructureType;
  state?: string;
  query?: string;
  loadLimit: number;
  loadFunction: ({ category, query, page, state }: FunctionPropsType) => void;
}

const LoadLessBtn: React.FC<LoadLessBtnProps> = ({
  data,
  state = 'loadless',
  query,
  loadLimit,
  loadFunction: LoadLessFunction,
}) => {
  const { inPageNavState: category } = useHomeBlogStore();

  if (data.results.length > loadLimit) {
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
