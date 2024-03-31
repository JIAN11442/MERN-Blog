import InpageNavigation from '../components/inpage-navigation.component';
import AniamationWrapper from '../components/page-animation.component';

const Homepage = () => {
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
            <h1>Latest Blogs Here</h1>
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
