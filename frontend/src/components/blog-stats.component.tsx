import { twMerge } from "tailwind-merge";
import { ActivityStructureType } from "../commons/types.common";

interface BlogStatsProps {
  stats: ActivityStructureType;
  className?: string;
}

const BlogStats: React.FC<BlogStatsProps> = ({ stats, className }) => {
  return (
    <div
      className={twMerge(
        `
        flex
        gap-2
        pt-2
        max-lg:mb-6
        max-lg:pb-2
        max-lg:border-b 
        max-lg:border-grey-custom
        `,
        className
      )}
    >
      {Object.keys(stats).map((key, i) =>
        !key.includes("parent") ? (
          <div
            key={i}
            className={`
              flex
              flex-col
              w-full
              h-full
              p-4
              max-lg:px-6
              xl:px-6
              items-center
              justify-center
              ${
                i !== 0 &&
                `
                  border-l
                  border-grey-custom
                `
              }
            `}
          >
            {/* Count */}
            <h1
              className="
                text-lg
                lg:text-2xl
                mb-2
              "
            >
              {stats[key as keyof typeof stats]?.toLocaleString()}
            </h1>

            {/* Object */}
            <p
              className="
                capitalize
                max-lg:text-grey-dark
              "
            >
              {key.split("_")[1]}
            </p>
          </div>
        ) : (
          ""
        )
      )}
    </div>
  );
};

export default BlogStats;
