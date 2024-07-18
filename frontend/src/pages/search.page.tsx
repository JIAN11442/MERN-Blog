import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AnimationWrapper from "../components/page-animation.component";
import InpageNavigation, {
  activeButtonRef,
} from "../components/inpage-navigation.component";
import AuthorCardList from "../components/author-card-list.component";
import BlogCardList from "../components/blog-card-list.component";

import useHomeBlogStore from "../states/home-blog.state";
import useNavbarStore from "../states/navbar.state";

import useBlogFetch from "../fetchs/blog.fetch";
import useUserFetch from "../fetchs/user.fetch";

import { FlatIcons } from "../icons/flaticons";

import type { GenerateToLoadStructureType } from "../commons/types.common";

const SearchPage = () => {
  const { query } = useParams();

  const [inPageNavIndex, setInPageNavIndex] = useState(0);

  const { queryBlogs } = useHomeBlogStore();
  const { searchBarVisibility } = useNavbarStore();

  const { GetLatestBlogsByQuery } = useBlogFetch();
  const { GetRelatedBlogsAuthorByQuery } = useUserFetch();

  useEffect(() => {
    // 取得 title 中包含 query 的所有資料
    GetLatestBlogsByQuery({ query, page: 1 });
    GetRelatedBlogsAuthorByQuery({ query, page: 1 });
    // 同時，觸發點擊 activeButtonRef，
    // 讓 InpageNavigation 的 hr 位置可以根據 button 長寬變化
    activeButtonRef.current?.click();
  }, [query]);

  return (
    <AnimationWrapper
      keyValue="searchpage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section
        className={`
          flex
          h-cover
          gap-10
          justify-center
          ${searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""}
        `}
      >
        {/* searching related blogs(md-screen) and users(min-screen) */}
        <div className="w-full">
          <InpageNavigation
            inPageNavIndex={inPageNavIndex}
            setInPageNavIndex={setInPageNavIndex}
            routes={[`Search Results from "${query}"`, "Accounts Matched"]}
            defaultHiddenIndex={1}
            adaptiveAdjustment={{ initialToFirstTab: true }}
          >
            {/* Search result of related blogs */}
            <BlogCardList
              id="queryBlogs"
              data={queryBlogs as GenerateToLoadStructureType}
              noDataMessage={"No blogs published"}
              loadLimit={import.meta.env.VITE_BLOGS_LIMIT}
              loadFunction={(props) =>
                GetLatestBlogsByQuery({ ...props, query })
              }
              className="-mt-4"
            />

            {/* Search result of related Authors */}
            <AuthorCardList query={query || ""} className="-mt-4" />
          </InpageNavigation>
        </div>

        {/* searching related users(md-screen) */}
        <div
          className="
            min-w-[40%]
            lg:min-w-[350px]
            max-w-min
            border-l
            border-grey-custom
            pl-8
            pt-3
            max-md:hidden
          "
        >
          {/* Title */}
          <div
            className="
              flex
              gap-x-3
              mb-8
              items-center
            "
          >
            <h1 className="text-xl font-medium">Users related to search</h1>
            <FlatIcons name="fi fi-sr-users" />
          </div>

          {/* Users */}
          <AuthorCardList query={query || ""} className="-mt-4" />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default SearchPage;
