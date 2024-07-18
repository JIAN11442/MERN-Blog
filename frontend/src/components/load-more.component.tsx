import useHomeBlogStore from "../states/home-blog.state";

import type {
  LoadFunctionPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface LoadMoreBtnProps {
  data: GenerateToLoadStructureType;
  loadFunction: (props: LoadFunctionPropsType) => void;
}

const LoadMoreBtn: React.FC<LoadMoreBtnProps> = ({
  data,
  loadFunction: LoadMoreFunction,
}) => {
  const { inPageNavState: category } = useHomeBlogStore();

  if ((data?.results?.length ?? 0) < (data.totalDocs ?? 0)) {
    return (
      <div
        onClick={() =>
          LoadMoreFunction({
            category,
            page: data.page + 1,
            state: "loadmore",
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
