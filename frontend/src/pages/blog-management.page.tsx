import { useEffect } from "react";

import InpageNavigation, {
  activeTabLineRef,
} from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/blog-nodata.component";
import AnimationWrapper from "../components/page-animation.component";
import ManagePublishedBlogCard from "../components/manage-published-blog-card.component";
import LoadOptions from "../components/load-options.components";
import ManageDraftBlogCard from "../components/manage-draft-blogs-card.component";
import DeleteBlogWarningModal from "../components/delete-blog-warning.component";

import { FlatIcons } from "../icons/flaticons";

import useDashboardStore from "../states/dashboard.state";
import useHomeBlogStore from "../states/home-blog.state";

import useDashboardFetch from "../fetchs/dashboard.fetch";
import {
  BlogStructureType,
  GenerateToLoadStructureType,
} from "../commons/types.common";

const BlogManagementPage = () => {
  const inpageNavOptions = ["Published Blogs", "Drafts"];

  const { inPageNavIndex, setInPageNavIndex } = useHomeBlogStore();
  const {
    query,
    publishedBlogs,
    draftBlogs,
    activeDeletePblogWarningModal,
    activeDeleteDfblogWarningModal,
    refreshBlogs,
    setQuery,
    setPublishedBlogs,
    setDraftBlogs,
  } = useDashboardStore();

  const { GetUserWrittenBlogsById } = useDashboardFetch();

  // 搜索框的提交事件
  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    if (e.key === "Enter" && value.length > 0 && value !== query) {
      setPublishedBlogs(null);
      setDraftBlogs(null);

      setQuery(value);
    }
  };

  // 如果搜索框失去焦點，並且搜索框的值為空，
  // 則清空搜索結果，且觸發 useEffect 重新獲取數據
  // 簡單來說就是還原初始資料
  const handleInputOnBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (query.length > 0 && value.length === 0) {
      setPublishedBlogs(null);
      setDraftBlogs(null);

      setQuery(value);
    }
  };

  // 切換 inpageNavIndex
  const handleSwitchInpageNav = (index: number) => {
    setInPageNavIndex(index);
  };

  // 根據 query 來取得用戶的已發佈或草稿的 blogs
  useEffect(() => {
    if (publishedBlogs === null) {
      GetUserWrittenBlogsById({
        page: 1,
        draft: false,
        query: query,
        deleteDocCount: 0,
      });
    }
    if (draftBlogs === null) {
      GetUserWrittenBlogsById({
        page: 1,
        draft: true,
        query: query,
        deleteDocCount: 0,
      });
    }

    return () => {
      setPublishedBlogs(null);
      setDraftBlogs(null);
    };
  }, [query, refreshBlogs]);

  // 當 inpageNavIndex 改變時，
  // 檢查 activeTabLineRef 是否在正確的位置
  // 如果不正確，通過點擊目標 btn 來移動 activeTabLineRef
  useEffect(() => {
    const handleResize = () => {
      const ref = activeTabLineRef.current;

      if (
        window.innerWidth >= 768 &&
        ((inPageNavIndex <= 0 && (ref?.offsetLeft ?? 0) > 0) ||
          (inPageNavIndex > 0 && (ref?.offsetLeft ?? 0) <= 0))
      ) {
        const target = document.getElementById(
          inpageNavOptions[inPageNavIndex]
        );
        target?.click();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [inPageNavIndex]);

  return (
    <div>
      {/* Warning */}
      <>
        {activeDeletePblogWarningModal.state && (
          <DeleteBlogWarningModal state="published" />
        )}
        {activeDeleteDfblogWarningModal.state && (
          <DeleteBlogWarningModal state="draft" />
        )}
      </>

      {/* Title */}
      <h1
        className="
          max-md:hidden
          mb-5
          text-xl
          font-medium
          truncate
        "
      >
        Manager Blogs
      </h1>

      {/* SearchBar */}
      <div
        className="
          relative
          mb-5
        "
      >
        <input
          type="text"
          placeholder={`Search blogs...`}
          onBlur={(e) => handleInputOnBlur(e)}
          onKeyDown={(e) => handleInputSubmit(e)}
          className="
            w-full
            p-4
            md:pl-14
            max-md:pl-5
            pr-6
            bg-grey-custom
            rounded-md
            placeholder:text-grey-dark/50
            focus:placeholder:opacity-0
          "
        />

        <FlatIcons
          name="fi fi-rr-search"
          className="
            absolute
            max-md:right-5
            md:left-5
            md:pointer-events-none
            top-1/2
            -translate-y-1/2
            text-md
            text-grey-dark/50
            
          "
        />
      </div>

      {/* InpageNavigateBtn - max-md screen */}
      <div
        className="
          flex
          gap-4
          pt-5
          pb-6
          md:hidden
        "
      >
        {inpageNavOptions.map((route, i) => (
          <button
            key={i}
            onClick={() => handleSwitchInpageNav(i)}
            className={`
              ${
                route === inpageNavOptions[inPageNavIndex]
                  ? "btn-dark"
                  : "btn-light"
              }
            `}
          >
            {route}
          </button>
        ))}
      </div>

      {/* InpageNavigation - md screen */}
      <InpageNavigation
        routes={inpageNavOptions}
        className="
          max-md:hidden
          mb-6
        "
      >
        {/* Published Blogs */}
        <div>
          {publishedBlogs === null ? (
            <Loader />
          ) : "results" in publishedBlogs && publishedBlogs.results?.length ? (
            <>
              {publishedBlogs.results.map((blog, i) => (
                <AnimationWrapper
                  key={`published-blog-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <ManagePublishedBlogCard
                    index={i}
                    blog={blog as BlogStructureType}
                  />
                </AnimationWrapper>
              ))}
            </>
          ) : (
            <NoDataMessage message="No published blogs" />
          )}
        </div>

        {/* Drafts Blogs */}
        <div>
          {draftBlogs === null ? (
            <Loader />
          ) : "results" in draftBlogs && draftBlogs.results?.length ? (
            <>
              {draftBlogs.results.map((blog, i) => (
                <AnimationWrapper
                  key={`draft-blog-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <ManageDraftBlogCard
                    index={i}
                    blog={blog as BlogStructureType}
                  />
                </AnimationWrapper>
              ))}
            </>
          ) : (
            <NoDataMessage message="No drafts blogs" />
          )}
        </div>
      </InpageNavigation>

      {/* Load Options */}
      <>
        {publishedBlogs !== null && draftBlogs !== null ? (
          <LoadOptions
            id={inpageNavOptions[inPageNavIndex]}
            data={
              (inPageNavIndex === 0
                ? publishedBlogs
                : draftBlogs) as GenerateToLoadStructureType
            }
            loadLimit={import.meta.env.VITE_MANAGE_BLOGS_LIMIT}
            loadFunction={GetUserWrittenBlogsById}
            draft={inPageNavIndex === 0 ? false : true}
            query={query}
          />
        ) : (
          ""
        )}
      </>
    </div>
  );
};

export default BlogManagementPage;
