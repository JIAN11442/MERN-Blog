import NoDataMessage from "./blog-nodata.component";
import Loader from "./loader.component";
import AnimationWrapper from "./page-animation.component";
import UserCard from "./author-card.component";
import LoadOptions from "./load-options.component";

import useHomeBlogStore from "../states/home-blog.state";
import useUserFetch from "../fetchs/user.fetch";

import type {
  AuthorStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface AuthorCardListProps {
  query: string;
  className?: string;
}

const AuthorCardList: React.FC<AuthorCardListProps> = ({
  query,
  className,
}) => {
  const { queryUsers } = useHomeBlogStore();
  const { GetRelatedBlogsAuthorByQuery } = useUserFetch();

  return (
    <>
      {queryUsers === null ? (
        <Loader />
      ) : "results" in queryUsers && queryUsers?.results?.length ? (
        <div>
          {queryUsers?.results?.map((user, i) => (
            <AnimationWrapper
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <UserCard user={user as AuthorStructureType} />
            </AnimationWrapper>
          ))}

          {/* Load Operation */}
          <LoadOptions
            id="queryUsers"
            data={queryUsers as GenerateToLoadStructureType}
            loadLimit={import.meta.env.VITE_USERS_LIMIT}
            loadFunction={(props) =>
              GetRelatedBlogsAuthorByQuery({ ...props, query })
            }
            className={className}
          />
        </div>
      ) : (
        <NoDataMessage message="No users found" />
      )}
    </>
  );
};

export default AuthorCardList;
