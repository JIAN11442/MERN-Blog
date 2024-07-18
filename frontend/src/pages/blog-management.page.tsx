import { useEffect, useState } from "react";

import InpageNavigation from "../components/inpage-navigation.component";
import DeleteBlogWarningModal from "../components/delete-blog-warning.component";
import BlogCardList from "../components/blog-card-list.component";

import { FlatIcons } from "../icons/flaticons";

import useDashboardStore from "../states/dashboard.state";
import useDashboardFetch from "../fetchs/dashboard.fetch";
import { GenerateToLoadStructureType } from "../commons/types.common";

const BlogManagementPage = () => {
  const inpageNavOptions = ["Published", "Drafts"];

  const [inPageNavIndex, setInPageNavIndex] = useState(0);
  const {
    blogQuery,
    publishedBlogs,
    draftBlogs,
    activeDeletePblogWarningModal,
    activeDeleteDfblogWarningModal,
    refreshBlogs,
    setBlogQuery,
    setPublishedBlogs,
    setDraftBlogs,
  } = useDashboardStore();

  const { GetUserWrittenBlogsById } = useDashboardFetch();

  // 搜索框的提交事件
  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    if (e.key === "Enter" && value.length > 0 && value !== blogQuery) {
      setPublishedBlogs(null);
      setDraftBlogs(null);

      setBlogQuery(value);
    }
  };

  // 如果搜索框失去焦點，並且搜索框的值為空，
  // 則清空搜索結果，且觸發 useEffect 重新獲取數據
  // 簡單來說就是還原初始資料
  const handleInputOnBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (blogQuery.length > 0 && value.length === 0) {
      setPublishedBlogs(null);
      setDraftBlogs(null);

      setBlogQuery(value);
    }
  };

  // 切換 inpageNavIndex
  const handleSwitchInpageNav = (index: number) => {
    setInPageNavIndex(index);
  };

  // 根據 query 來取得用戶的已發佈或草稿的 blogs
  useEffect(() => {
    GetUserWrittenBlogsById({
      page: 1,
      draft: false,
      query: blogQuery,
      deleteDocCount: 0,
    });

    GetUserWrittenBlogsById({
      page: 1,
      draft: true,
      query: blogQuery,
      deleteDocCount: 0,
    });

    return () => {
      setPublishedBlogs(null);
      setDraftBlogs(null);
    };
  }, [blogQuery, inPageNavIndex, refreshBlogs]);

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
          placeholder={`Search ${inpageNavOptions[
            inPageNavIndex
          ].toLowerCase()}...`}
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
        inPageNavIndex={inPageNavIndex}
        setInPageNavIndex={setInPageNavIndex}
        adaptiveAdjustment={{ initialToFirstTab: false }}
        className="
          max-md:hidden
          mb-6
        "
      >
        {/* Published Blogs */}
        <BlogCardList
          id="published-blogs"
          data={publishedBlogs as GenerateToLoadStructureType}
          noDataMessage={"No published blogs"}
          for_type={"published"}
          loadLimit={import.meta.env.VITE_MANAGE_BLOGS_LIMIT}
          loadFunction={(props) =>
            GetUserWrittenBlogsById({
              ...props,
              draft: false,
              query: blogQuery,
            })
          }
        />

        {/* Drafts Blogs */}
        <BlogCardList
          id="draft-blogs"
          data={draftBlogs as GenerateToLoadStructureType}
          noDataMessage={"No drafts blogs"}
          for_type="drafts"
          loadLimit={import.meta.env.VITE_MANAGE_BLOGS_LIMIT}
          loadFunction={(props) =>
            GetUserWrittenBlogsById({ ...props, draft: true, query: blogQuery })
          }
        />
      </InpageNavigation>
    </div>
  );
};

export default BlogManagementPage;
