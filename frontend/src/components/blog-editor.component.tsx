/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditorJS from '@editorjs/editorjs';

import logo from '../imgs/logo.png';
import defaultBanner from '../imgs/banner.png';

import AniamationWrapper from './page-animation.component';
import tools from './tools.component';

import useBlogStore from '../states/editor-blog.state';
import useBlogFetch from '../fetchs/blog.fetch';
import useAwsFetch from '../fetchs/aws.fetch';

const BlogEditor = () => {
  const blogBannerRef = useRef<HTMLImageElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  const { blog, setBlog, setTextEditor, textEditor, setEditorState } =
    useBlogStore();
  const { UploadImageToAWS } = useAwsFetch();
  const { UploadSaveDraftBlog } = useBlogFetch();

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
        UploadImageToAWS(img)
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
  const handleTitleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    let value = e.currentTarget.value;

    // Capitalize the first letter
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
      e.currentTarget.value = value;
    }
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    setBlog({ ...blog, title: input.value });

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
        data: blog.content, // { blocks: [] } or { time:? , blocks: [?] version: ?}
        placeholder: 'Enter text or type tab key to start writing...',
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
  }, []);

  // Change Code Box Style and Auto Resize
  useEffect(() => {
    // 創建一個帶有回調函數的觀察器(observer)
    const observer = new MutationObserver((mutation) => {
      // 監聽 textEditor 的變化
      mutation.forEach((mut) => {
        // 取得 textEditor 新增的節點
        mut.addedNodes.forEach((node) => {
          // 如果節點是元素節點
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 根據已知的目標 class 取得目標元素節點
            const textarea = (node as HTMLElement).querySelector(
              '.ce-code__textarea'
            ) as HTMLTextAreaElement;
            // 如果目標元素存在，監聽 input 事件並自動調整高度
            if (textarea) {
              textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
              });
            }
          }
        });
      });
    });

    // 因為上一個 useEffect 會在組件渲染前會初始化 EditorJS
    // 所以這裡可以確保 textEditor 一定會存在
    // 而我們的目標是要監聽 textEditor 內的其他元素（codeblock）
    const initialNode = document.getElementById('textEditor');

    //  如果 textEditor 存在
    if (initialNode) {
      // 則使用剛創建的觀察器開始觀察 textEditor，
      // 每次 textEditor 內的元素有變化時，就會觸發回調函數
      // 也就是檢查是否有新增的 codeblock，並自動調整高度
      observer.observe(initialNode, {
        childList: true, // 觀察子節點的變化
        subtree: true, // 觀察所有後代節點
      });
    }

    // 返回一個清理函數，用於在組件卸載時關閉觀察器
    return () => {
      observer.disconnect();
    };
  }, []);

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
          <button onClick={(e) => UploadSaveDraftBlog(e)} className="btn-light">
            Save Draft
          </button>
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
              defaultValue={blog.title}
              placeholder="Blog Title"
              onInput={(e) => handleTitleInput(e)}
              onChange={(e) => handleTitleChange(e)}
              onKeyDown={(e) => handleTitleKeyDown(e)}
              className="
                mt-10
                w-full
                h-20
                text-2xl
                md:text-3xl
                font-medium
                outline-none
                resize-none
                leading-tight
                placeholder:opacity-40
                overflow-hidden
              "
            />

            {/* Separate Line */}
            <hr className="w-full my-2 md:my-5" />

            {/* EditorJs */}
            <div id="textEditor" />
          </div>
        </section>
      </AniamationWrapper>
    </>
  );
};

export default BlogEditor;
