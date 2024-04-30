import axios from 'axios';

import useHomeBlogStore from '../states/home-blog.state';
import type {
  FetchBlogsPropsType,
  GenerateStructureType,
} from '../../../backend/src/utils/types.util';

import { FormatData } from '../commons/generate.common';

const useUserFetch = () => {
  const USER_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + '/user';

  const { queryUsers, setQueryUsers } = useHomeBlogStore();

  // Get related blogs author
  const GetRelatedBlogsAuthorByQuery = async ({
    query,
    page = 1,
    state = 'initial',
  }: FetchBlogsPropsType) => {
    const requestURL = USER_SERVER_ROUTE + '/query-related-users';

    await axios.post(requestURL, { query, page }).then(async ({ data }) => {
      if (data.queryUsers) {
        const formattedData = await FormatData({
          prevArr: queryUsers,
          fetchData: data.queryUsers,
          page,
          countRoute: '/query-related-users-count',
          fetchRoute: 'user',
          data_to_send: { query },
          state,
        });

        setQueryUsers(formattedData as GenerateStructureType);
      }
    });
  };

  return {
    GetRelatedBlogsAuthorByQuery,
  };
};

export default useUserFetch;
