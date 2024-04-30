import axios from 'axios';

import type { FormatBlogDataProps } from '../../../backend/src/utils/types.util';

// Generate fetch data from blog and user
export const FormatData = async ({
  prevArr,
  fetchData,
  page,
  countRoute,
  fetchRoute = 'blog',
  data_to_send,
  state = 'initial',
}: FormatBlogDataProps) => {
  let obj;

  const SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + `/${fetchRoute}`;

  // Loadmore
  if (state === 'loadmore' && prevArr !== null) {
    obj = {
      ...prevArr,
      results: 'results' in prevArr &&
        fetchData && [...prevArr.results, ...fetchData],
      page: page,
      prevLoadNum: 'prevLoadNum' in prevArr && [
        ...prevArr.prevLoadNum,
        fetchData?.length,
      ],
    };
  }
  // Loadless
  else if (state === 'loadless' && prevArr !== null && page > 1) {
    // 每一次都取 prevArr 中 prevLoadNum 的最後一個數字，同時刪除它
    // 這樣就可以知道要減少多少筆數據
    const reduceNum =
      ('prevLoadNum' in prevArr && prevArr.prevLoadNum.pop()) || 0;

    obj = {
      ...prevArr,
      results: 'results' in prevArr && [
        ...prevArr.results.slice(0, prevArr.results.length - reduceNum),
      ],
      page: page - 1,
      prevLoadNum: 'prevLoadNum' in prevArr && prevArr.prevLoadNum,
    };
  }
  // Initial
  else {
    if (data_to_send) {
      await axios
        .post(SERVER_ROUTE + countRoute, data_to_send)
        .then(({ data: { totalDocs } }) => {
          obj = { results: fetchData, page: 1, totalDocs, prevLoadNum: [] };
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      await axios
        .get(SERVER_ROUTE + countRoute)
        .then(({ data: { totalDocs } }) => {
          obj = { results: fetchData, page: 1, totalDocs, prevLoadNum: [] };
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  return obj;
};
