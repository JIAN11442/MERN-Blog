import { twMerge } from "tailwind-merge";

import LoadLessBtn from "./load-less.component";
import LoadMoreBtn from "./load-more.component";
import HandyToolsBtn from "./handy-tool.component";

import {
  GenerateToLoadStructureType,
  type LoadFunctionPropsType,
} from "../commons/types.common";

interface LoadOptionsProps {
  id: string;
  data: GenerateToLoadStructureType;
  loadLimit: number;
  loadFunction: (props: LoadFunctionPropsType) => void;
  className?: string;
}

const LoadOptions: React.FC<LoadOptionsProps> = ({
  id,
  data,
  loadLimit,
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
      <LoadMoreBtn data={data} loadFunction={loadFunction} />

      {/* Load less button */}
      <LoadLessBtn
        data={data}
        loadLimit={loadLimit}
        loadFunction={loadFunction}
      />

      {/* Scroll to top */}
      <HandyToolsBtn name="BackToTop" type="textBtn" />
    </div>
  );
};

export default LoadOptions;
