import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import AniamationWrapper from '../components/page-animation.component';
import InpageNavigation, {
  activeButtonRef,
} from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-card-banner.component';
import NoDataMessage from '../components/blog-nodata.component';
import LoadOptions from '../components/load-options.components';

import useHomeBlogStore from '../states/home-blog.state';
import useCollapseStore from '../states/collapse.state';

import useBlogFetch from '../fetchs/blog.fetch';

const SearchPage = () => {
  const { query } = useParams();

  const { searchBarVisibility } = useCollapseStore();
  const { loadBlogsLimit, queryBlogs } = useHomeBlogStore();
  const { GetLatestBlogsByQuery } = useBlogFetch();

  useEffect(() => {
    // 取得 title 中包含 query 的所有資料
    GetLatestBlogsByQuery({ query, page: 1 });
    // 同時，觸發點擊 activeButtonRef，
    // 讓 InpageNavigation 的 hr 位置可以根據 button 長寬變化
    activeButtonRef.current?.click();
  }, [query]);

  return (
    <AniamationWrapper
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
        <div className="w-full">
          <InpageNavigation
            routes={[`Search Results from "${query}"`, 'Accounts Matched']}
            defaultHiddenIndex={1}
          >
            <>
              {queryBlogs === null ? (
                // 如果 queryBlogs 為 null，顯示 loader
                <Loader loader={{ speed: 1, size: 50 }} />
              ) : queryBlogs &&
                'results' in queryBlogs &&
                queryBlogs.results.length ? (
                // 如果 queryBlogs 不為 null 且有長度，則顯示 blog card
                <div>
                  {queryBlogs.results.map((blog, i) => (
                    // delay: i * 0.1 可以讓每個 blog card 依次延遲出現
                    <AniamationWrapper
                      key={blog.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        author={blog.author?.personal_info ?? {}}
                        content={blog}
                      />
                    </AniamationWrapper>
                  ))}

                  {/* Load Operation */}
                  <LoadOptions
                    id="queryBlogs"
                    data={queryBlogs}
                    loadBlogsLimit={loadBlogsLimit}
                    query={query}
                  />
                </div>
              ) : (
                // 如果 latestBlogs 不為 null 且沒有值，顯示 NoDataMessage
                <NoDataMessage message="No blogs published" />
              )}
            </>
          </InpageNavigation>
        </div>
      </section>
    </AniamationWrapper>
  );
};

export default SearchPage;
