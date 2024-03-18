import { useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import logo from '../imgs/logo.png';
import defaultBanner from '../imgs/blog banner.png';

import AniamationWrapper from './page-animation.component';
import { uploadImage } from '../commons/aws.common';

const BlogEditor = () => {
  const blogBannerRef = useRef<HTMLImageElement | null>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Get the image file
      const img = e.target.files[0];

      // Show loading toast
      const loadingToast = toast.loading('Uploading...');

      if (img) {
        uploadImage(img)
          .then((url) => {
            if (url && blogBannerRef.current) {
              // Dismiss the loading toast and show success toast
              toast.dismiss(loadingToast);
              toast.success('Uploaded successfully');

              // Set the image url to the blog banner
              blogBannerRef.current.src = url;
            }
          })
          .catch((err) => {
            toast.dismiss(loadingToast);
            toast.error(err);
          });
      }
    }
  };
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Blogging" className=" flex-none w-10" />
        </Link>

        {/* Navbar Title */}
        <p
          className="
            max-md:hidden
            text-black-custom
            line-clamp-1
            w-full
          "
        >
          New Blog
        </p>

        {/* Publish and save draft button */}
        <div
          className="
            flex
            gap-2
            ml-auto
          "
        >
          <button className="btn-dark">Publish</button>
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
              <label htmlFor="uploadBanner">
                {/* 由於 <img> 位於 <label> 底下, 而基於 <label> 的特性, 
                    點擊 <img> 也能觸發與 <label> 建立關係的 <input>,
                    因此這裡的 <img> 就是一個隱藏的 <input> 按鈕
                */}
                <img ref={blogBannerRef} src={defaultBanner} className="z-10" />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={(e) => handleBannerUpload(e)}
                />
              </label>
            </div>
          </div>
        </section>
      </AniamationWrapper>
    </>
  );
};

export default BlogEditor;
