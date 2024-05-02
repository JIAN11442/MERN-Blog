import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import useBlogFetch from '../fetchs/blog.fetch';

import useTargetBlogStore from '../states/target-blog.state';

import type { BlogStructureType } from '../../../backend/src/utils/types.util';
import AnimationWrapper from '../components/page-animation.component';
import Loader from '../components/loader.component';

const BlogPage = () => {
  const { blogId } = useParams();
  const { GetTargetBlogInfo } = useBlogFetch();
  const { targetBlogInfo, initialBlogInfo } = useTargetBlogStore();

  // 因為原本的 BlogStructureType 是可選的，所以如果要在這裡呼叫所有屬性，typescript 會報錯，因為有可能為 undefined
  // 所以這裡使用 Required<BlogStructureType> 來告訴 typescript 這個物件裡面的所有屬性都是必要的
  // 這樣就不會報錯了
  const {
    title,
    content,
    banner,
    author: {
      personal_info: { username, fullname, profile_img },
    },
    publishedAt,
  } = targetBlogInfo as Required<BlogStructureType>;

  // Fetch target blog info
  useEffect(() => {
    if (blogId) {
      GetTargetBlogInfo(blogId);
    }

    // 當離開這個頁面時，把 targetBlogInfo 重設為初始值
    // 這樣下次進來這個頁面時，就不會看到上次的資料
    return () => {
      initialBlogInfo();
    };
  }, [blogId]);

  return (
    <AnimationWrapper
      key="BlogPage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!publishedAt ? (
        <Loader
          loader={{ speed: 1, size: 50 }}
          className={{ container: 'mt-5' }}
        />
      ) : (
        <div
          className="
            max-w-[900px]
            mx-auto
            py-10
            max-lg:px-[5vw]
          "
        >
          {/* Banner */}
          <img src={banner} className="aspect-video" />

          <div className="mt-12">
            <h2>{title}</h2>
          </div>
        </div>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
