import { useEffect } from 'react';
import axios from 'axios';

import InpageNavigation from '../components/inpage-navigation.component';
import AniamationWrapper from '../components/page-animation.component';

import useHomeBlogStore from '../states/home-blog.state';
import Loader from '../components/loader.component';

const Homepage = () => {
  const { latestBlogs, setLatestBlogs } = useHomeBlogStore();

  // fetch latest blogs
  useEffect(() => {
    const requestURL =
      import.meta.env.VITE_SERVER_DOMAIN + '/blogs/latest-blogs';

    axios
      .get(requestURL)
      .then(({ data }) => {
        if (data.latestBlogs.length) {
          setLatestBlogs(data.latestBlogs);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <AniamationWrapper
      keyValue="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <section
        className="
          flex
          h-cover
          justify-center
          gap-10
        "
      >
        {/* latest blogs */}
        <div className="w-full">
          <InpageNavigation
            routes={['home', 'trending blogs']}
            defaultHiddenIndex={1}
          >
            <>
              {latestBlogs === null ? (
                <Loader loader={{ speed: 1, size: 30 }} />
              ) : (
                <div>
                  {latestBlogs.map((blog, i) => (
                    <h1 key={i}>{blog.title}</h1>
                  ))}
                </div>
              )}
            </>
            <h1>Trending Blogs Here</h1>
          </InpageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div></div>
      </section>
    </AniamationWrapper>
  );
};

export default Homepage;
