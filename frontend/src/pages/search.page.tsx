import { useParams } from 'react-router-dom';

import AniamationWrapper from '../components/page-animation.component';
import InpageNavigation, {
  activeButtonRef,
} from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import BlogPostCard from '../components/blog-card-banner.component';
import LoadMoreBtn from '../components/load-more.component';
import NoDataMessage from '../components/blog-nodata.component';

import useHomeBlogStore from '../states/home-blog.state';
import useCollapseStore from '../states/collapse.state';
import { useEffect } from 'react';
import useBlogFetch from '../fetchs/blog.fetch';

const SearchPage = () => {
  const { query } = useParams();

  const { searchBarVisibility } = useCollapseStore();
  const { latestBlogs, setLatestBlogs } = useHomeBlogStore();
  const { GetLatestBlogsBySearch } = useBlogFetch();

  useEffect(() => {
    // 在得到 query 當下，立馬將 lastestBlogs 設定為 null，觸發 loading 狀態
    // 另外也是為了之後在 GetLatestBlogsBySearch() 的時候，
    // 可以不會因為 latestBlogs 有值而將搜索結果累加到原本的 latestBlogs 中
    setLatestBlogs(null);

    // 同時，觸發點擊 activeButtonRef，讓 InpageNavigation 的 hr 位置可以根據 button 長寬變化
    activeButtonRef.current?.click();
  }, [query]);

  useEffect(() => {
    // 但取得 query 並設定 latestBlogs 為 null 後，開始搜索取得目標 blogs
    if (latestBlogs === null) {
      GetLatestBlogsBySearch({ query, page: 1 });
    }
  }, [latestBlogs]);

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
              {latestBlogs === null ? (
                // 如果 latestBlogs 為 null，顯示 loader
                <Loader loader={{ speed: 1, size: 50 }} />
              ) : 'results' in latestBlogs && latestBlogs.results.length ? (
                // 如果 latestBlogs 不為 null 且有長度，則顯示 blog card
                <div>
                  {latestBlogs.results.map((blog, i) => (
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

                  <LoadMoreBtn data={latestBlogs} />
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
