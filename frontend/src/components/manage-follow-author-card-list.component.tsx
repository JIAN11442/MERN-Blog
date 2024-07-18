import Loader from "./loader.component";
import NoDataMessage from "./blog-nodata.component";
import AnimationWrapper from "./page-animation.component";
import ManageFollowAuthorCard from "./manage-follow-author-card.component";
import LoadOptions from "./load-options.component";

import useAuthStore from "../states/user-auth.state";

import useDashboardFetch from "../fetchs/dashboard.fetch";

import {
  FollowAuthorsPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

interface ManageFollowAuthorCardListProps {
  data: GenerateToLoadStructureType;
  for_fetch: string;
  for_page?: boolean;
  for_profile?: boolean;
  query?: string;
  btnStyle?: string;
  sortByUpdated?: boolean;
}

const ManageFollowAuthorCardList: React.FC<ManageFollowAuthorCardListProps> = ({
  data,
  for_fetch,
  for_page = true,
  for_profile = false,
  query = "",
  btnStyle,
  sortByUpdated = false,
}) => {
  const { authUser } = useAuthStore();
  const { GetFollowAuthors } = useDashboardFetch();

  const totalLoadNum = (data?.results?.length ?? 0) - 1;

  return (
    <>
      {/* Follow List */}
      <>
        {data === null ? (
          <Loader />
        ) : data && "results" in data && data.results && data.results.length ? (
          data.results.map((author, i) => (
            <AnimationWrapper
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ManageFollowAuthorCard
                index={i}
                data={author as FollowAuthorsPropsType}
                state={for_fetch.toLowerCase()}
                for_page={for_page}
                for_profile={for_profile}
                totalLoadNum={totalLoadNum}
                btnStyle={btnStyle}
              />
            </AnimationWrapper>
          ))
        ) : (
          <NoDataMessage message={`No ${for_fetch.toLowerCase()}`} />
        )}
      </>

      {/* Load Options */}
      <>
        {data !== null && for_page ? (
          <LoadOptions
            id={for_fetch.toLowerCase()}
            data={data}
            loadLimit={import.meta.env.VITE_MANAGE_AUTHORS_LIMIT}
            loadFunction={(props) =>
              GetFollowAuthors({
                ...props,
                query,
                authorUsername: authUser?.username,
                fetchFor: for_fetch.toLowerCase(),
                sortByUpdated,
              })
            }
          />
        ) : (
          ""
        )}
      </>
    </>
  );
};

export default ManageFollowAuthorCardList;
