import useHomeBlogStore from "../states/home-blog.state";

import type {
  LoadFunctionPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface LoadMoreBtnProps {
  data: GenerateToLoadStructureType;
  state?: string;
  query?: string;
  authorId?: string;
  filter?: string;
  loadFunction: ({
    category,
    query,
    authorId,
    filter,
    page,
    state,
  }: LoadFunctionPropsType) => void;
}

const LoadMoreBtn: React.FC<LoadMoreBtnProps> = ({
  data,
  query,
  authorId,
  filter,
  state = "loadmore",
  loadFunction: LoadMoreFunction,
}) => {
  const { inPageNavState: category } = useHomeBlogStore();

  if ((data?.results?.length ?? 0) < data.totalDocs) {
    return (
      <div
        onClick={() =>
          LoadMoreFunction({
            category,
            query,
            authorId,
            filter,
            page: data.page + 1,
            state,
          })
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
