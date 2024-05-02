import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import AnimationWrapper from '../components/page-animation.component';
import InpageNavigation, {
  activeButtonRef,
} from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-card-banner.component';
import NoDataMessage from '../components/blog-nodata.component';
import LoadOptions from '../components/load-options.components';
import UserCardWrapper from '../components/user-card-wrapper.component';

import useHomeBlogStore from '../states/home-blog.state';
import useCollapseStore from '../states/collapse.state';

import useBlogFetch from '../fetchs/blog.fetch';
import useUserFetch from '../fetchs/user.fetch';

import { FlatIcons } from '../icons/flaticons';

import type { BlogStructureType } from '../../../backend/src/utils/types.util';

const SearchPage = () => {
  const { query } = useParams();

  const { searchBarVisibility } = useCollapseStore();
  const { loadBlogsLimit, queryBlogs } = useHomeBlogStore();
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
          ${searchBarVisibility ? 'translate-y-[80px] md:translate-y-0' : ''}
        `}
      >
        {/* searching related blogs(md-screen) and users(min-screen) */}
        <div className="w-full">
          <InpageNavigation
            routes={[`Search Results from "${query}"`, 'Accounts Matched']}
            defaultHiddenIndex={1}
          >
            {/* Search result of related blogs */}
            <>
              {queryBlogs === null ? (
                // 如果 queryBlogs 為 null，顯示 loader
                <Loader loader={{ speed: 1, size: 50 }} />
              ) : queryBlogs &&
                'results' in queryBlogs &&
                queryBlogs.results.length ? (
                // 如果 queryBlogs 不為 null 且有長度，則顯示 blog card
                <div>
                  {queryBlogs.results.map((blog: BlogStructureType, i) => (
                    // delay: i * 0.1 可以讓每個 blog card 依次延遲出現
                    <AnimationWrapper
                      key={blog.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        author={blog.author?.personal_info ?? {}}
                        content={blog}
                      />
                    </AnimationWrapper>
                  ))}

                  {/* Load Operation */}
                  <LoadOptions
                    id="queryBlogs"
                    data={queryBlogs}
                    loadLimit={loadBlogsLimit}
                    loadFunction={GetLatestBlogsByQuery}
                    query={query}
                  />
                </div>
              ) : (
                // 如果 latestBlogs 不為 null 且沒有值，顯示 NoDataMessage
                <NoDataMessage message="No blogs published" />
              )}
            </>

            {/* Search result of related Authors */}
            <UserCardWrapper query={query || ''} />
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
          <UserCardWrapper query={query || ''} />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default SearchPage;
