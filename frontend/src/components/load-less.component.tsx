import useHomeBlogStore from "../states/home-blog.state";

import {
  GenerateToLoadStructureType,
  type LoadFunctionPropsType,
} from "../commons/types.common";

interface LoadLessBtnProps {
  data: GenerateToLoadStructureType;
  state?: string;
  query?: string;
  authorId?: string;
  filter?: string;
  loadLimit: number;
  loadFunction: ({
    category,
    query,
    authorId,
    filter,
    page,
    state,
  }: LoadFunctionPropsType) => void;
}

const LoadLessBtn: React.FC<LoadLessBtnProps> = ({
  data,
  state = "loadless",
  query,
  authorId,
  filter,
  loadLimit,
  loadFunction: LoadLessFunction,
}) => {
  const { inPageNavState: category } = useHomeBlogStore();

  if ((data?.results?.length ?? 0) > loadLimit) {
    return (
      <div
        onClick={() =>
          LoadLessFunction({
            category,
            query,
            authorId,
            filter,
            page: data.page,
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
        <p className="text-nowrap">Load less</p>
      </div>
    );
  }
};

export default LoadLessBtn;
