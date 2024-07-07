import { BlogStructureType } from "../commons/types.common";

interface ManageDraftBlogCardProps {
  blog: BlogStructureType;
}

const ManageDraftBlogCard: React.FC<ManageDraftBlogCardProps> = ({ blog }) => {
  const { banner, title } = blog;

  return (
    <div
      className={`
        flex
        gap-10
        py-6
        max-md:px-4
        border-b
        border-grey-custom
        items-center
      `}
    >
      <img
        src={banner}
        className="
          w-28
          h-28
          flex-none
          max-md:hidden
          lg:hidden
          xl:block
          bg-grey-custom
          object-cover
          rounded-md
        "
      />

      <p>{title}</p>
    </div>
  );
};

export default ManageDraftBlogCard;
