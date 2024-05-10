import axios from "axios";

import useHomeBlogStore from "../states/home-blog.state";
import type {
  FetchLoadPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

import { FormatDataForLoadMoreOrLess } from "../commons/generate.common";
import useAuthorProfileStore from "../states/author-profile.state";

const useUserFetch = () => {
  const USER_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/user";

  const { queryUsers, setQueryUsers } = useHomeBlogStore();
  const { setAuthorProfileInfo } = useAuthorProfileStore();

  // Get related blogs author
  const GetRelatedBlogsAuthorByQuery = async ({
    query,
    page = 1,
    state = "initial",
  }: FetchLoadPropsType) => {
    const requestURL = USER_SERVER_ROUTE + "/query-related-users";

    await axios
      .post(requestURL, { query, page })
      .then(async ({ data }) => {
        if (data.queryUsers) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: queryUsers,
            fetchData: data.queryUsers,
            page,
            countRoute: "/query-related-users-count",
            fetchRoute: "user",
            data_to_send: { query },
            state,
          });

          setQueryUsers(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Get author profile information
  const GetAuthorProfileInfo = async (authorId: string) => {
    const requestURL = USER_SERVER_ROUTE + "/get-author-profile-info";

    axios
      .post(requestURL, { username: authorId })
      .then(({ data }) => {
        if (data.author) {
          setAuthorProfileInfo(data.author);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return {
    GetRelatedBlogsAuthorByQuery,
    GetAuthorProfileInfo,
  };
};

export default useUserFetch;
