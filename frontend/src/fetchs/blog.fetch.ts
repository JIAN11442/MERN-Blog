import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import useHomeBlogStore from "../states/home-blog.state";
import useEditorBlogStore from "../states/editor-blog.state";
import useAuthStore from "../states/user-auth.state";
import type {
  FetchBlogsPropsType,
  FormatBlogDataProps,
  GenerateBlogStructureType,
} from "../../../backend/src/utils/types.util";

const useBlogFetch = () => {
  const BLOG_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/blog";

  const navigate = useNavigate();

  const { authUser } = useAuthStore();
  const { blog, textEditor, characterLimit } = useEditorBlogStore();
  const {
    setLatestBlogs,
    setTrendingBlogs,
    setCategories,
    latestBlogs,
    trendingBlogs,
  } = useHomeBlogStore();

  // Generate blog data
  const FormatBlogData = async ({
    prevArr,
    fetchData,
    page,
    countRoute,
    data_to_send,
    state = "initial",
  }: FormatBlogDataProps) => {
    let obj;

    // Loadmore
    if (state === "loadmore" && prevArr !== null) {
      obj = {
        ...prevArr,
        results: "results" in prevArr &&
          fetchData && [...prevArr.results, ...fetchData],
        page: page,
        prevLoadNum: "prevLoadNum" in prevArr && [
          ...prevArr.prevLoadNum,
          fetchData?.length,
        ],
      };
    }
    // Loadless
    else if (state === "loadless" && prevArr !== null && page > 1) {
      // 每一次都取 prevArr 中 prevLoadNum 的最後一個數字，同時刪除它
      // 這樣就可以知道要減少多少筆數據
      const reduceNum =
        ("prevLoadNum" in prevArr && prevArr.prevLoadNum.pop()) || 0;

      obj = {
        ...prevArr,
        results: "results" in prevArr && [
          ...prevArr.results.slice(0, prevArr.results.length - reduceNum),
        ],
        page: page - 1,
        prevLoadNum: "prevLoadNum" in prevArr && prevArr.prevLoadNum,
      };
    }
    // Initial
    else {
      if (data_to_send) {
        await axios
          .post(BLOG_SERVER_ROUTE + countRoute, data_to_send)
          .then(({ data: { totalDocs } }) => {
            obj = { results: fetchData, page: 1, totalDocs, prevLoadNum: [] };
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        await axios
          .get(BLOG_SERVER_ROUTE + countRoute)
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

  // Fetch latest blogs
  const GetLatestBlogs = async ({ page = 1, state }: FetchBlogsPropsType) => {
    const requestURL =
      import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs";

    await axios
      .post(requestURL, { page })
      .then(async ({ data }) => {
        if (data.latestBlogs) {
          const formattedData = await FormatBlogData({
            prevArr: latestBlogs,
            fetchData: data.latestBlogs,
            page,
            countRoute: "/latest-blogs-count",
            state,
          });

          setLatestBlogs(formattedData as GenerateBlogStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch latest blogs by category
  const GetLatestBlogsBySearch = async ({
    category,
    query,
    page = 1,
    state,
  }: FetchBlogsPropsType) => {
    const requestURL = BLOG_SERVER_ROUTE + "/search-latest-blogs";
    await axios
      .post(requestURL, { category, query, page })
      .then(async ({ data }) => {
        if (data.tagBlogs) {
          const formattedData = await FormatBlogData({
            prevArr: latestBlogs,
            fetchData: data.tagBlogs,
            page,
            countRoute: "/search-latest-blogs-count",
            data_to_send: { category, query },
            state,
          });

          setLatestBlogs(formattedData as GenerateBlogStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch trending tags
  const GetTrendingTags = async () => {
    const requestURL = BLOG_SERVER_ROUTE + "/trending-tags";

    await axios
      .get(requestURL)
      .then(({ data }) => {
        if (data.trendingTags) {
          // const newCategories = [...data.trendingTags, 'nothing test'];
          setCategories(data.trendingTags);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch trending blogs
  const GetTrendingBlogs = async ({ page = 1, state }: FetchBlogsPropsType) => {
    const requestURL =
      import.meta.env.VITE_SERVER_DOMAIN + "/blog/trending-blogs";

    await axios
      .post(requestURL, { page })
      .then(async ({ data }) => {
        if (data.trendingBlogs) {
          const formattedData = await FormatBlogData({
            prevArr: trendingBlogs,
            fetchData: data.trendingBlogs,
            page,
            countRoute: "/latest-blogs-count",
            state,
          });

          setTrendingBlogs(formattedData as GenerateBlogStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const PublishCompleteBlog = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;

    // 如果按鈕已經被 disable，則不執行任何動作
    if (target.className.includes("disable")) {
      return;
    }

    // 判斷資料是否完整
    const { title, des, tags, banner, content } = blog;

    if (!title?.length) {
      return toast.error("Write blog title before publishing.");
    }

    if (!des?.length || des.length > characterLimit) {
      return toast.error(
        `Write blog description about your blog within ${characterLimit} characters to publish.`
      );
    }

    if (!tags?.length) {
      return toast.error("Enter at least 1 tag to help us rank your blog.");
    }

    // 如果完整，則啟動 loading toast，表示正在發布
    const loadingToast = toast.loading("Publishing....");

    // 同時，將按鈕 disable，避免重複點擊
    (target as HTMLButtonElement).classList.add("disable");

    // 發布 blog
    const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog";
    const blogData = { title, banner, des, content, tags, draft: false };

    axios
      .post(requestUrl, blogData, {
        headers: { Authorization: `Bearer ${authUser?.access_token}` },
      })
      .then(({ data }) => {
        if (data) {
          // 如果成功訪問並返回數據，移除 disable 狀態
          (e.target as HTMLButtonElement).classList.remove("disable");

          // 關閉 loading toast
          toast.dismiss(loadingToast);
          toast.success(data.message);

          // 移動到首頁
          setTimeout(() => {
            navigate("/");
          }, 500);
        }
      })
      .catch((error) => {
        // 如果訪問過程中出現錯誤，也要移除 disable 狀態
        (e.target as HTMLButtonElement).classList.remove("disable");

        // 關閉 loading toast
        toast.dismiss(loadingToast);

        return toast.error(error.response.data.errorMessage);
      });
  };

  // Upload and save draft blog
  const UploadSaveDraftBlog = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;

    // 如果按鈕已經被 disable，則不執行任何動作
    if (target.className.includes("disable")) {
      return;
    }

    const { title, banner, des, tags } = blog;

    // 如果標題為空，則顯示警告訊息並停止下一步操作
    if (!title?.length) {
      return toast.error("Write blog title before saving it as a draft.");
    }

    // 反之，顯示 loading toast 表示開始保存草稿
    const loadingToast = toast.loading("Saving Draft....");

    // 同時，將按鈕設置為 disable 狀態，避免重複點擊
    (e.target as HTMLButtonElement).classList.add("disable");

    // 如果 textEditor 已經初始化了，則代表有內容可以保存(即使是空內容)
    if (textEditor?.isReady) {
      // 保存內容並...保存草稿
      textEditor.save().then((content) => {
        // 訪問後端 API 路徑
        const requestUrl =
          import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog";

        // 要上傳到資料庫的數據
        const blogData = { title, banner, des, content, tags, draft: true };

        // 開始訪問後端 API
        axios
          .post(requestUrl, blogData, {
            headers: { Authorization: `Bearer ${authUser?.access_token}` },
          })
          .then(({ data }) => {
            if (data) {
              // 如果成功訪問並返回數據，移除 disable 狀態
              (target as HTMLButtonElement).classList.remove("disable");

              // 關閉 loading toast 並顯示成功訊息
              toast.dismiss(loadingToast);
              toast.success("Draft saved successfully.");

              // 0.5秒后移動到首頁
              setTimeout(() => {
                navigate("/");
              }, 500);
            }
          })
          .catch((error) => {
            // 如果訪問過程中出現錯誤，也要移除 disable 狀態
            (e.target as HTMLButtonElement).classList.remove("disable");

            // 關閉 loading toast
            toast.dismiss(loadingToast);

            return toast.error(error.response.data.errorMessage);
          });
      });
    }
  };

  return {
    UploadSaveDraftBlog,
    PublishCompleteBlog,
    GetLatestBlogs,
    GetTrendingBlogs,
    GetTrendingTags,
    GetLatestBlogsBySearch,
    FormatBlogData,
  };
};

export default useBlogFetch;
