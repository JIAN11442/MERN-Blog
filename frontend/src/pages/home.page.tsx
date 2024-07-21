/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";

import InpageNavigation, {
  activeButtonRef,
} from "../components/inpage-navigation.component";
import AnimationWrapper from "../components/page-animation.component";
import BlogCardList from "../components/blog-card-list.component";

import { FlatIcons } from "../icons/flaticons";

import useNavbarStore from "../states/navbar.state";
import useHomeBlogStore from "../states/home-blog.state";
import useProviderStore from "../states/provider.state";

import useBlogFetch from "../fetchs/blog.fetch";

import type { GenerateToLoadStructureType } from "../commons/types.common";

const Homepage = () => {
  const [inpageNavIndex, setInPageNavIndex] = useState(0);

  const { theme } = useProviderStore();
  const { searchBarVisibility } = useNavbarStore();
  const {
    latestBlogs,
    trendingBlogs,
    inPageNavState,
    allCategories,
    setLatestBlogs,
    setInPageNavState,
  } = useHomeBlogStore();

  const {
    GetLatestBlogs,
    GetTrendingBlogs,
    GetLatestBlogsByCategory,
    GetTrendingTags,
  } = useBlogFetch();

  const loadBlogByCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 取得 Button 的文字內容
    const category = e.currentTarget.textContent?.toLowerCase();

    //  點擊後立馬清空 latestBlogs，讓它為 null，觸發 loading 狀態
    setLatestBlogs(null);

    // 接著防止重複點擊，或是點擊相同的分類，直接返回 home
    // 如果 inPageNavState 已經是 category，則設定為 home
    if (inPageNavState === category) {
      setInPageNavState("home");
      return;
    }

    // 反之如果 inPageNavState 與 category 不一樣，
    // 則將 inPageNavState 設定為 category，改變分類名稱及內容
    setInPageNavState(category!);
  };

  // fetch latest blogs
  useEffect(() => {
    // 為了讓 InpageNavigation 的 hr 長度在變更 inpageNavState 後可以與內容吻合，
    // 我們需要在這裡特別點擊 activeButtonRef 促使 changePageState() 中的 btn 改變
    // 使得 hr 的 left 和 width 屬性可以正確設定
    activeButtonRef.current?.click();

    // 如果 latestBlogs 不為 null，則返回
    // 為了避免每次刷新會重複 fetch blogs 並累加在 latestBlogs 中
    if (latestBlogs) return;

    // 如果 inPageNavState 是 home，則 fetch 最新的 blog
    if (inPageNavState === "home") {
      GetLatestBlogs({ page: 1, state: "initial" });
    } else {
      // 反之如果 inPageNavState 不是 home，則 fetch 特定分類的 blog
      GetLatestBlogsByCategory({
        category: inPageNavState,
        page: 1,
        state: "initial",
      });
    }

    // 如果 inPageNavState 是 trending blogs，則 fetch 熱門的 blog
    if (!trendingBlogs) {
      GetTrendingBlogs({ page: 1, state: "initial" });
    }

    // 如果 allCategories 是空的，則 fetch 熱門的 tags
    if (!allCategories || !allCategories.length) {
      GetTrendingTags();
    }
  }, [inPageNavState, latestBlogs]);

  return (
    <AnimationWrapper
      keyValue="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section
        className={`
          flex
          h-cover
          gap-8
          justify-center
          ${searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""}
        `}
      >
        {/* latest blogs(md-screen) && trending blogs(min-screen) */}
        <div className="w-full">
          <InpageNavigation
            routes={[inPageNavState, "trending blogs"]}
            inPageNavIndex={inpageNavIndex}
            setInPageNavIndex={setInPageNavIndex}
            defaultHiddenIndex={1}
            adaptiveAdjustment={{ initialToFirstTab: true }}
          >
            {/* Latest blogs */}
            <BlogCardList
              id="latestBlogs"
              data={latestBlogs as GenerateToLoadStructureType}
              noDataMessage={"No blogs published"}
              loadLimit={import.meta.env.VITE_BLOGS_LIMIT}
              loadFunction={(props) =>
                inPageNavState === "home"
                  ? GetLatestBlogs({ ...props })
                  : GetLatestBlogsByCategory({ ...props })
              }
            />

            {/* Trending blogs - min screen */}
            <BlogCardList
              id="trending-min-screen"
              data={trendingBlogs as GenerateToLoadStructureType}
              noDataMessage={"No trending blogs"}
              for_type="no-banner"
              loadLimit={import.meta.env.VITE_BLOGS_LIMIT}
              loadFunction={(props) => GetTrendingBlogs({ ...props })}
            />
          </InpageNavigation>
        </div>

        {/* tags filters && minimal trending blogs(md-screen) */}
        <div
          className="
            min-w-[40%]
            lg:min-w-[450px]
            max-w-min
            border-l
            border-grey-custom
            pl-8
            pt-3
            max-md:hidden
          "
        >
          <div className="flex flex-col gap-10">
            {/* Trending tags */}
            <div>
              {/* Title */}
              <h1 className="text-xl font-medium mb-8">
                Stories from all interests
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-3">
                {allCategories !== null &&
                  allCategories.map((category, i) => (
                    <button
                      key={i}
                      className={`
                        text-nowrap
                        ${
                          category === inPageNavState
                            ? theme === "light"
                              ? `
                                btn-dark
                                text-white-custom
                                hover:opacity-90
                              `
                              : ` btn-dark
                                  bg-[#1DA1F2]
                                  text-white
                                  hover:opacity-90
                                `
                            : `
                                tag
                                hover:bg-grey-dark/10
                              `
                        }
                          transition
                        `}
                      onClick={(e) => loadBlogByCategory(e)}
                    >
                      {category}
                    </button>
                  ))}
              </div>
            </div>

            {/* Trending blogs - middle screen*/}
            <div>
              {/* Title */}
              <div
                className="
                  flex
                  gap-x-2
                  items-center
                  mb-2
              "
              >
                <h1 className="text-xl font-medium">Trending</h1>
                <FlatIcons name="fi fi-br-arrow-trend-up" />
              </div>

              {/* Blogs */}
              <BlogCardList
                id="trending-md-screen"
                data={trendingBlogs as GenerateToLoadStructureType}
                noDataMessage={"No trending blogs"}
                for_type="no-banner"
                loadLimit={import.meta.env.VITE_BLOGS_LIMIT}
                loadFunction={(props) => GetTrendingBlogs({ ...props })}
              />
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Homepage;
