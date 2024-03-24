import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditorJS from '@editorjs/editorjs';

import logo from '../imgs/logo.png';
import defaultBanner from '../imgs/banner.png';

import AniamationWrapper from './page-animation.component';
import tools from './tools.component';

import { uploadImage } from '../commons/aws.common';
import useBlogStore from '../states/blog.state';

const BlogEditor = () => {
  const blogBannerRef = useRef<HTMLImageElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  const { blog, setBlog, setTextEditor, textEditor, setEditorState } =
    useBlogStore();

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Get the image file
      const img = e.target.files[0];

      // Check the file type
      if (!img.type.startsWith('image/')) {
        return toast.error('Please upload an image type file.');
      }

      if (img) {
        // Show loading toast
        const loadingToast = toast.loading('Uploading...');

        // Upload the image to S3
        uploadImage(img)
          .then((url) => {
            if (url && blogBannerRef.current) {
              // Set the image url to the blog banner
              blogBannerRef.current.src = url;
              setBlog({ ...blog, banner: url });

              blogBannerRef.current.onload = () => {
                // Dismiss the loading toast and show success toast
                toast.dismiss(loadingToast);
                toast.success('Uploaded successfully');
              };
            }
          })
          .catch((err) => {
            toast.dismiss(loadingToast);
            toast.error(err);
          });
      }
    }
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    // Set the navbar blog title
    const generatedTitle =
      input.value.charAt(0).toUpperCase() + input.value.slice(1);

    setBlog({ ...blog, title: generatedTitle });

    // Auto resize the textarea with the content
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const img = e.target as HTMLImageElement;
    img.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!blog.banner?.length) {
      return toast.error('Please upload a blog banner.');
    }
    if (!blog.title?.length) {
      return toast.error('Please enter a blog title.');
    }
    if (textEditor?.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState('publish');
          } else {
            return toast.error('Write something in your blog to publish it.');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Initialize the EditorJs
  useEffect(() => {
    // Initialize the EditorJs for once(because useEffect cause rending twice)
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'textEditor',
        tools: tools,
        data: { blocks: [] },
        placeholder: "Let's write an awesome story",
      });

      editorRef.current = editor;

      editor.isReady.then(() => {
        setTextEditor(editor);
      });
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [editorRef, setTextEditor]);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className=" flex-none w-10">
          <img src={logo} alt="Blogging" />
        </Link>

        {/* Navbar Title */}
        <p
          className="
            w-full
            max-md:hidden
            text-xl
            text-black-custom
            font-medium
            line-clamp-1
            normal-case
          "
        >
          {blog.title || 'New Blog'}
        </p>

        {/* Publish and save draft button */}
        <div
          className="
            flex
            gap-2
            ml-auto
          "
        >
          <button onClick={handlePublishEvent} className="btn-dark">
            Publish
          </button>
          <button className="btn-light">Save Draft</button>
        </div>
      </nav>

      {/* Main Content */}
      <AniamationWrapper
        keyValue="blog-editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <section>
          <div
            className="
              mx-auto
              max-w-[900px]
              w-full
            "
          >
            {/* Banner */}
            <div
              className="
                relative
                aspect-video
                bg-white
                border-4
                border-grey-custom
                hover:opacity-80
                transition
              "
            >
              <label htmlFor="uploadBanner" className="cursor-pointer">
                {/* 由於 <img> 位於 <label> 底下, 而基於 <label> 的特性, 
                    點擊 <img> 也能觸發與 <label> 建立關係的 <input>,
                    因此這裡的 <img> 就是一個隱藏的 <input> 按鈕
                */}
                <img
                  ref={blogBannerRef}
                  src={blog.banner}
                  onError={(e) => handleImageError(e)}
                  className={`
                    z-10
                    object-cover
                  `}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={(e) => handleBannerUpload(e)}
                />
              </label>
            </div>

            {/* Blog Title */}
            <textarea
              placeholder="Blog Title"
              onKeyDown={(e) => handleTitleKeyDown(e)}
              onChange={(e) => handleTitleChange(e)}
              className="
                mt-10
                w-full
                h-20
                text-3xl
                md:text-4xl
                font-medium
                outline-none
                resize-none
                leading-tight
                placeholder:opacity-40
                overflow-hidden
              "
            ></textarea>

            {/* Separate Line */}
            <hr className="w-full my-2 md:my-5" />

            {/* EditorJs */}
            <div id="textEditor"></div>
          </div>
        </section>
      </AniamationWrapper>
    </>
  );
};

export default BlogEditor;
