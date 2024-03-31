/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditorJS from '@editorjs/editorjs';
import axios from 'axios';

import logo from '../imgs/logo.png';
import defaultBanner from '../imgs/banner.png';

import AniamationWrapper from './page-animation.component';
import tools from './tools.component';

import { uploadImage } from '../commons/aws.common';
import useBlogStore from '../states/editor-blog.state';
import useAuthStore from '../states/user-auth.state';

const BlogEditor = () => {
  const navigate = useNavigate();

  const blogBannerRef = useRef<HTMLImageElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  const { blog, setBlog, setTextEditor, textEditor, setEditorState } =
    useBlogStore();
  const { authUser } = useAuthStore();

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

  const handleSaveDraftEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;

    // 如果按鈕已經被 disable，則不執行任何動作
    if (target.className.includes('disable')) {
      return;
    }

    const { title, banner, des, tags } = blog;

    // 如果標題為空，則顯示警告訊息並停止下一步操作

    if (!title?.length) {
      return toast.error('Write blog title before saving it as a draft.');
    }

    // 反之，顯示 loading toast 表示開始保存草稿
    const loadingToast = toast.loading('Saving Draft....');

    // 同時，將按鈕設置為 disable 狀態，避免重複點擊
    (e.target as HTMLButtonElement).classList.add('disable');

    // 如果 textEditor 已經初始化了，則代表有內容可以保存(即使是空內容)
    if (textEditor?.isReady) {
      // 保存內容並...保存草稿
      textEditor.save().then((content) => {
        // 訪問後端 API 路徑
        const requestUrl =
          import.meta.env.VITE_SERVER_DOMAIN + '/blog/create-blog';

        // 要上傳到資料庫的數據
        const blogData = { title, banner, des, content, tags, draft: true };

        // 開始訪問後端 API
        axios
          .post(requestUrl, blogData, {
            headers: { Authorization: `Bearer ${authUser?.access_token}` },
          })
          .then(({ data }) => {
            if (data) {
              // 如果成功訪問並返回數據，移除 disable 狀態
              (target as HTMLButtonElement).classList.remove('disable');

              // 關閉 loading toast 並顯示成功訊息
              toast.dismiss(loadingToast);
              toast.success('Draft saved successfully.');

              // 0.5秒后移動到首頁
              setTimeout(() => {
                navigate('/');
              }, 500);
            }
          })
          .catch((error) => {
            // 如果訪問過程中出現錯誤，也要移除 disable 狀態
            (e.target as HTMLButtonElement).classList.remove('disable');

            // 關閉 loading toast
            toast.dismiss(loadingToast);

            return toast.error(error.response.data.errorMessage);
          });
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
          <button
            onClick={(e) => handleSaveDraftEvent(e)}
            className="btn-light"
          >
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
