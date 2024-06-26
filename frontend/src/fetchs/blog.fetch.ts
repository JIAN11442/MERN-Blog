import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import useHomeBlogStore from "../states/home-blog.state";
import useEditorBlogStore from "../states/blog-editor.state";
import useAuthStore from "../states/user-auth.state";
import useTargetBlogStore from "../states/target-blog.state";

import type {
  BlogStructureType,
  FetchBlogsPropsType,
  GenerateToLoadStructureType,
} from "../commons/types.common";
import useCommentFetch from "./comment.fetch";
import { FormatDataForLoadMoreOrLess } from "../commons/generate.common";
import useToastLoadingStore from "../states/toast-loading.state";

const useBlogFetch = () => {
  const BLOG_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/blog";

  const navigate = useNavigate();

  const { authUser } = useAuthStore();
  const { editorBlog, textEditor, characterLimit } = useEditorBlogStore();
  const {
    setLatestBlogs,
    setTrendingBlogs,
    setAllCategories,
    setQueryBlogs,
    latestBlogs,
    trendingBlogs,
    queryBlogs,
  } = useHomeBlogStore();

  const { setEditorBlog } = useEditorBlogStore();
  const { setToastLoading } = useToastLoadingStore();
  const { setTargetBlogInfo, setSimilarBlogsInfo } = useTargetBlogStore();

  const { GetAndGenerateCommentsData } = useCommentFetch();

  // Fetch latest blogs
  const GetLatestBlogs = async ({ page = 1, state }: FetchBlogsPropsType) => {
    const requestURL =
      import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs";

    await axios
      .post(requestURL, { page })
      .then(async ({ data }) => {
        if (data.latestBlogs) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: latestBlogs,
            fetchData: data.latestBlogs,
            page,
            countRoute: "/latest-blogs-count",
            state,
          });

          setLatestBlogs(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch latest blogs by category
  const GetLatestBlogsByCategory = async ({
    category,
    page = 1,
    state,
  }: FetchBlogsPropsType) => {
    const requestURL = BLOG_SERVER_ROUTE + "/category-latest-blogs";
    await axios
      .post(requestURL, { category, page })
      .then(async ({ data }) => {
        if (data.tagBlogs) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: latestBlogs,
            fetchData: data.tagBlogs,
            page,
            countRoute: "/category-latest-blogs-count",
            data_to_send: { category },
            state,
          });

          setLatestBlogs(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch latest blogs by query
  const GetLatestBlogsByQuery = async ({
    query,
    page = 1,
    state,
  }: FetchBlogsPropsType) => {
    const requestURL = BLOG_SERVER_ROUTE + "/query-latest-blogs";
    await axios
      .post(requestURL, { query, page })
      .then(async ({ data }) => {
        if (data.queryBlogs) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: queryBlogs,
            fetchData: data.queryBlogs,
            page,
            countRoute: "/query-latest-blogs-count",
            data_to_send: { query },
            state,
          });

          setQueryBlogs(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch latest blogs by author
  const GetLatestBlogsByAuthor = async ({
    authorId,
    page = 1,
    state,
  }: FetchBlogsPropsType) => {
    const requestURL = BLOG_SERVER_ROUTE + "/author-latest-blogs";

    await axios
      .post(requestURL, { authorId, page })
      .then(async ({ data }) => {
        if (data.authorBlogs) {
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: latestBlogs,
            fetchData: data.authorBlogs,
            page,
            countRoute: "/author-latest-blogs-count",
            data_to_send: { authorId },
            state,
          });

          setLatestBlogs(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch target blog info && similar blogs
  const GetTargetBlogInfo = async ({
    blogId,
    draft,
    mode,
  }: FetchBlogsPropsType) => {
    const targetReqURL = BLOG_SERVER_ROUTE + "/get-target-blog-info";

    await axios
      .post(targetReqURL, { blogId, draft, mode })
      .then(async ({ data: { blogData } }) => {
        if (blogData) {
          // 將重構後的 comment 資料架構更新到 blogData 的 comments 屬性
          blogData.comments = await GetAndGenerateCommentsData({
            blogObjectId: blogData._id,
            skip: 0,
          });

          // 為了在不重新向後端請求取得 latestBlogs 的情況下，即時改變目標 blog 的閲讀數
          // 這裡直接在本地更新 zustand 管理的 latestBlogs 數據
          if (latestBlogs && "results" in latestBlogs && latestBlogs.results) {
            const updateTargetBlogTotalReads = latestBlogs.results.map(
              (blog: BlogStructureType) => {
                if (blog.blog_id === blogData.blog_id) {
                  return {
                    ...blog,
                    activity: {
                      ...blog.activity,
                      total_reads: (blog?.activity?.total_reads ?? 0) + 1,
                    },
                  };
                } else {
                  return blog;
                }
              }
            );

            setLatestBlogs({
              ...latestBlogs,
              results: updateTargetBlogTotalReads,
            });
          }

          // 將目標 blog 資料傳到 targetBlogStore
          setTargetBlogInfo(blogData);

          // 同時，考慮到編輯狀態頁面也需要這個數據，所以也將數據傳到 editorBlogStore
          setEditorBlog(blogData);

          // Fetch similar blogs && set similar blogs info
          GetSimilarBlogsInfo({
            categories: blogData.tags,
            limit: 6,
            page: 1,
            eliminate_blogId: blogData.blog_id,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch similar blogs
  const GetSimilarBlogsInfo = async ({
    categories,
    limit,
    page,
    eliminate_blogId,
  }: FetchBlogsPropsType) => {
    const requestURL = BLOG_SERVER_ROUTE + "/get-similar-blogs";

    await axios
      .post(requestURL, {
        categories,
        limit,
        page,
        eliminate_blogId,
      })
      .then(({ data: { similarBlogs } }) => {
        if (similarBlogs) {
          setSimilarBlogsInfo(similarBlogs);
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
          setAllCategories(data.trendingTags);
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
          const formattedData = await FormatDataForLoadMoreOrLess({
            prevArr: trendingBlogs,
            fetchData: data.trendingBlogs,
            page,
            countRoute: "/latest-blogs-count",
            state,
          });

          setTrendingBlogs(formattedData as GenerateToLoadStructureType);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  interface PublishAndSaveDraftPropsType {
    e: React.MouseEvent<HTMLButtonElement>;
    paramsBlogId?: string;
  }

  const PublishCompleteBlog = ({
    e,
    paramsBlogId,
  }: PublishAndSaveDraftPropsType) => {
    const target = e.target as HTMLElement;

    // 如果按鈕已經被 disable，則不執行任何動作
    if (target.className.includes("disable")) {
      return;
    }

    // 判斷資料是否完整
    const { title, des, tags, banner, content } = editorBlog;

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

    setToastLoading(true);

    // 同時，將按鈕 disable，避免重複點擊
    (target as HTMLButtonElement).classList.add("disable");

    // 發布 blog
    const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog";
    const blogData = {
      title,
      banner,
      des,
      content,
      tags,
      draft: false,
      paramsBlogId,
    };

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
          setToastLoading(false);

          toast.success(data.message);

          // 移動到首頁
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        }
      })
      .catch((error) => {
        // 如果訪問過程中出現錯誤，也要移除 disable 狀態
        (e.target as HTMLButtonElement).classList.remove("disable");

        // 關閉 loading toast
        toast.dismiss(loadingToast);
        setToastLoading(false);

        return toast.error(error.response.data.errorMessage);
      });
  };

  // Upload and save draft blog
  const UploadSaveDraftBlog = ({
    e,
    paramsBlogId,
  }: PublishAndSaveDraftPropsType) => {
    const target = e.target as HTMLElement;

    // 如果按鈕已經被 disable，則不執行任何動作
    if (target.className.includes("disable")) {
      return;
    }

    const { title, banner, des, tags } = editorBlog;

    // 如果標題為空，則顯示警告訊息並停止下一步操作
    if (!title?.length) {
      return toast.error("Write blog title before saving it as a draft.");
    }

    // 反之，顯示 loading toast 表示開始保存草稿
    const loadingToast = toast.loading("Saving Draft....");

    setToastLoading(true);

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
        const blogData = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
          paramsBlogId,
        };

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
              setToastLoading(false);

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
            setToastLoading(false);

            return toast.error(error.response.data.errorMessage);
          });
      });
    }
  };

  return {
    UploadSaveDraftBlog,
    PublishCompleteBlog,
    GetLatestBlogs,
    GetLatestBlogsByCategory,
    GetLatestBlogsByQuery,
    GetLatestBlogsByAuthor,
    GetTargetBlogInfo,
    GetSimilarBlogsInfo,
    GetTrendingBlogs,
    GetTrendingTags,
  };
};

export default useBlogFetch;
