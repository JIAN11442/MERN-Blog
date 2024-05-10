import NoDataMessage from "./blog-nodata.component";
import Loader from "./loader.component";
import AnimationWrapper from "./page-animation.component";
import UserCard from "./user-card.component";
import LoadOptions from "./load-options.components";

import useHomeBlogStore from "../states/home-blog.state";

import type {
  AuthorStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";
import useUserFetch from "../fetchs/user.fetch";

interface UserCardWrapperProps {
  query: string;
}

const UserCardWrapper: React.FC<UserCardWrapperProps> = ({ query }) => {
  const { queryUsers, loadUsersLimit } = useHomeBlogStore();
  const { GetRelatedBlogsAuthorByQuery } = useUserFetch();

  return (
    <>
      {queryUsers === null ? (
        <Loader loader={{ speed: 1, size: 50 }} />
      ) : "results" in queryUsers && queryUsers.results.length ? (
        <div>
          {queryUsers.results.map((user, i) => (
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
            loadLimit={loadUsersLimit}
            loadFunction={GetRelatedBlogsAuthorByQuery}
            query={query}
          />
        </div>
      ) : (
        <NoDataMessage message="No users found" />
      )}
    </>
  );
};

export default UserCardWrapper;
