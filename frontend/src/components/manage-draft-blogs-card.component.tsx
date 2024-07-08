import { BlogStructureType } from "../commons/types.common";

interface ManageDraftBlogCardProps {
  index: number;
  blog: BlogStructureType;
}

const ManageDraftBlogCard: React.FC<ManageDraftBlogCardProps> = ({
  index,
  blog,
}) => {
  const newIndex = index + 1;
  const { banner, title } = blog;

  return (
    <div
      className={`
        flex
        gap-10
        py-6
        ${index === 0 && "pt-0"}
        max-md:px-4
        border-b
        border-grey-custom
      `}
    >
      <h1 className="blog-index">
        {newIndex < 10 ? `0${newIndex}` : newIndex}
      </h1>
    </div>
  );
};

export default ManageDraftBlogCard;
