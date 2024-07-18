import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import Tag from "./tag.component";
import AnimationWrapper from "./page-animation.component";

import useEditorBlogStore from "../states/blog-editor.state";

import { FlatIcons } from "../icons/flaticons";

import useBlogFetch from "../fetchs/blog.fetch";

const PublishEditor = () => {
  const { blogId: paramsBlogId } = useParams();
  const { PublishCompleteBlog } = useBlogFetch();
  const {
    editorBlog,
    characterLimit,
    tagsLimit,
    setEditorBlog,
    setEditorState,
  } = useEditorBlogStore();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };
  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;

    setEditorBlog({ ...editorBlog, title: input.value });
  };
  const handleBlogDesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setEditorBlog({ ...editorBlog, des: input.value });
  };
  const handleDesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const tag = (e.target as HTMLInputElement).value;

      if (editorBlog.tags && editorBlog.tags.length < tagsLimit) {
        if (tag.length) {
          if (!editorBlog.tags.includes(tag)) {
            setEditorBlog({ ...editorBlog, tags: [...editorBlog.tags, tag] });
          } else {
            toast.error("Tag already exists.");
          }
        } else {
          toast.error("Tag cannot be empty.");
        }
      } else {
        toast.error(`You can only add ${tagsLimit} tags.`);
      }

      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <AnimationWrapper
      keyValue="publish-editor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
          mx-auto
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
            <img src={editorBlog.banner} />
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
            {editorBlog.title}
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
            {editorBlog.des}
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
              defaultValue={editorBlog.title}
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
              defaultValue={editorBlog.des}
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
              {characterLimit - (editorBlog.des?.length ?? 0)} characters left
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
                py-4
                px-4
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
              {editorBlog.tags?.map((tag, index) => {
                return <Tag key={index} tag={tag} index={index} />;
              })}
            </div>

            {/* Tags Limit */}
            <p
              className="
                mt-1 
                mb-4
                text-grey-dark
                text-sm
                text-right
               "
            >
              {tagsLimit - (editorBlog.tags?.length ?? 0)} Tags left
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={(e) => PublishCompleteBlog({ e, paramsBlogId })}
            className="
              btn-dark
              px-8
            "
          >
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishEditor;
