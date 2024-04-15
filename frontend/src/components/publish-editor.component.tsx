import toast from 'react-hot-toast';

import Tag from './tag.component';
import AniamationWrapper from './page-animation.component';

import useEditorBlogStore from '../states/editor-blog.state';
import { FlatIcons } from '../icons/flaticons';
import useBlogFetch from '../fetchs/blog.fetch';

const PublishEditor = () => {
  const { setEditorState, blog, setBlog, characterLimit, tagsLimit } =
    useEditorBlogStore();
  const { PublishCompleteBlog } = useBlogFetch();

  const handleCloseEvent = () => {
    setEditorState('editor');
  };
  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;

    setBlog({ ...blog, title: input.value });
  };
  const handleBlogDesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setBlog({ ...blog, des: input.value });
  };
  const handleDesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      const tag = (e.target as HTMLInputElement).value;

      if (blog.tags && blog.tags.length < tagsLimit) {
        if (tag.length) {
          if (!blog.tags.includes(tag)) {
            setBlog({ ...blog, tags: [...blog.tags, tag] });
          } else {
            toast.error('Tag already exists.');
          }
        } else {
          toast.error('Tag cannot be empty.');
        }
      } else {
        toast.error(`You can only add ${tagsLimit} tags.`);
      }

      (e.target as HTMLInputElement).value = '';
    }
  };
  // const handleBlogPublish = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   const target = e.target as HTMLElement;

  //   // 如果按鈕已經被 disable，則不執行任何動作
  //   if (target.className.includes("disable")) {
  //     return;
  //   }

  //   // 判斷資料是否完整
  //   const { title, des, tags, banner, content } = blog;

  //   if (!title?.length) {
  //     return toast.error("Write blog title before publishing.");
  //   }

  //   if (!des?.length || des.length > characterLimit) {
  //     return toast.error(
  //       `Write blog description about your blog within ${characterLimit} characters to publish.`
  //     );
  //   }

  //   if (!tags?.length) {
  //     return toast.error("Enter at least 1 tag to help us rank your blog.");
  //   }

  //   // 如果完整，則啟動 loading toast，表示正在發布
  //   const loadingToast = toast.loading("Publishing....");

  //   // 同時，將按鈕 disable，避免重複點擊
  //   (target as HTMLButtonElement).classList.add("disable");

  //   // 發布 blog
  //   const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog";
  //   const blogData = { title, banner, des, content, tags, draft: false };

  //   axios
  //     .post(requestUrl, blogData, {
  //       headers: { Authorization: `Bearer ${authUser?.access_token}` },
  //     })
  //     .then(({ data }) => {
  //       if (data) {
  //         // 如果成功訪問並返回數據，移除 disable 狀態
  //         (e.target as HTMLButtonElement).classList.remove("disable");

  //         // 關閉 loading toast
  //         toast.dismiss(loadingToast);
  //         toast.success(data.message);

  //         // 移動到首頁
  //         setTimeout(() => {
  //           navigate("/");
  //         }, 500);
  //       }
  //     })
  //     .catch((error) => {
  //       // 如果訪問過程中出現錯誤，也要移除 disable 狀態
  //       (e.target as HTMLButtonElement).classList.remove("disable");

  //       // 關閉 loading toast
  //       toast.dismiss(loadingToast);

  //       return toast.error(error.response.data.errorMessage);
  //     });
  // };
  return (
    <AniamationWrapper
      keyValue="publish-editor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <section
        className="
          w-screen
          min-h-screen
          grid
          items-center
          lg:grid-cols-2
          lg:gap-4
          py-16
        "
      >
        {/* Close button */}
        <button
          onClick={handleCloseEvent}
          className="
            w-12
            h-12
            absolute
            right-[5vw]
            top-[5%]
            lg:top-[10%]
            z-10
            hover:scale-110
            transition
          "
        >
          <FlatIcons name="fi fi-br-cross" />
        </button>

        {/* Preview Content */}
        <div className="block max-w-[550px] mx-auto">
          {/* Preview text */}
          <p className="text-grey-dark mb-1">Preview</p>

          {/* Preview image */}
          <div
            className="
              w-full
              aspect-video
              rounded-lg
              overflow-hidden
              bg-grey-custom
              mt-4
            "
          >
            <img src={blog.banner} />
          </div>

          {/* Preview title */}
          <h1
            className="
              text-2xl
              md:text-3xl
              font-medium
              mt-5
              leading-tight
              line-clamp-2
            "
          >
            {blog.title}
          </h1>

          {/* Preview description */}
          <p
            className="
              font-gelasio
              line-clamp-2
              text-xl
              leading-7
              mt-4
            "
          >
            {blog.des}
          </p>
        </div>

        {/* InputBox */}
        <div
          className="
            border-grey-custom
            lg:border-1
            lg:pl-8
          "
        >
          {/* Blog Title */}
          <div>
            <p className="text-grey-dark mb-2 mt-10">Blog Title</p>
            <input
              type="text"
              placeholder="Blog Title"
              defaultValue={blog.title}
              onChange={(e) => handleBlogTitleChange(e)}
              className="input-box pl-4"
            />
          </div>

          {/* Blog Description */}
          <div>
            <p className="text-grey-dark mb-2 mt-10">
              Short description about your blog
            </p>
            <textarea
              maxLength={characterLimit}
              defaultValue={blog.des}
              onChange={(e) => handleBlogDesChange(e)}
              onKeyDown={(e) => handleDesKeyDown(e)}
              className="
                h-40
                resize-none
                leading-7
                input-box
                pl-4
              "
            ></textarea>

            {/* Description character limit */}
            <p className="mt-1 text-grey-dark text-sm text-right">
              {characterLimit - (blog.des?.length ?? 0)} characters left
            </p>
          </div>

          {/* Blog Tags */}
          <div>
            <p className="text-grey-dark mb-2 mt-10">
              Topics - ( Helps is searching and ranking your blog post )
            </p>
            <div
              className="
                relative
                input-box
                py-2
                pl-2
                pb-4
            "
            >
              <input
                type="text"
                placeholder="Topic"
                onKeyDown={(e) => handleTopicKeyDown(e)}
                className="
                  input-box
                  bg-white-custom
                  focus:bg-white-custom
                  placeholder-grey-dark/30
                  top-0
                  left-0
                  pl-4
                  mb-3
                "
              />
              {blog.tags?.map((tag, index) => {
                return <Tag key={index} tag={tag} index={index} />;
              })}
            </div>

            {/* Tags Limit */}
            <p className="mt-1 mb-4 text-grey-dark text-sm text-right">
              {tagsLimit - (blog.tags?.length ?? 0)} Tags left
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={(e) => PublishCompleteBlog(e)}
            className="
              btn-dark
              px-8
            "
          >
            Publish
          </button>
        </div>
      </section>
    </AniamationWrapper>
  );
};

export default PublishEditor;
