import useHomeBlogStore from '../states/home-blog.state';

import type {
  FunctionPropsType,
  GenerateStructureType,
} from '../../../backend/src/utils/types.util';

interface LoadMoreBtnProps {
  data: GenerateStructureType;
  state?: string;
  query?: string;
  loadFunction: ({ category, query, page, state }: FunctionPropsType) => void;
}

const LoadMoreBtn: React.FC<LoadMoreBtnProps> = ({
  data,
  state = 'loadmore',
  query,
  loadFunction: LoadMoreFunction,
}) => {
  const { inPageNavState: category } = useHomeBlogStore();

  if (data.results.length < data.totalDocs) {
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
