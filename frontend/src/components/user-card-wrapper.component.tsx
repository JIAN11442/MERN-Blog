import NoDataMessage from './blog-nodata.component';
import Loader from './loader.component';
import AniamationWrapper from './page-animation.component';
import UserCard from './user-card.component';
import LoadOptions from './load-options.components';

import useHomeBlogStore from '../states/home-blog.state';

import type {
  AuthorStructureType,
  GenerateStructureType,
} from '../../../backend/src/utils/types.util';
import useBlogFetch from '../fetchs/blog.fetch';

interface UserCardWrapperProps {
  query: string;
}

const UserCardWrapper: React.FC<UserCardWrapperProps> = ({ query }) => {
  const { queryUsers, loadUsersLimit } = useHomeBlogStore();
  const { GetRelatedBlogsAuthorByQuery } = useBlogFetch();

  return (
    <>
      {queryUsers === null ? (
        <Loader loader={{ speed: 1, size: 50 }} />
      ) : 'results' in queryUsers && queryUsers.results.length ? (
        <div>
          {queryUsers.results.map((user, i) => (
            <AniamationWrapper
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            >
              <UserCard user={user as AuthorStructureType} />
            </AniamationWrapper>
          ))}

          {/* Load Operation */}
          <LoadOptions
            id="queryUsers"
            data={queryUsers as GenerateStructureType}
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
