import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";

import Loader from "../components/loader.component";
import InputBox from "../components/input-box.component";
import AnimationWrapper from "../components/page-animation.component";

import useAuthStore from "../states/user-auth.state";
import useAuthorProfileStore from "../states/author-profile.state";

import useUserFetch from "../fetchs/user.fetch";
import useSettingFetch from "../fetchs/setting.fetch";

import {
  AuthorProfileStructureType,
  GenerateAuthDataType,
  GenerateEditProfilePropsType,
} from "../commons/types.common";

const EditProfilePage = () => {
  type DataTypes = keyof typeof generateEditProfile;

  const BioMaxLength = import.meta.env.VITE_BIO_LIMIT;

  const formRef = useRef<HTMLFormElement>(null);
  const imgDisplayRef = useRef<HTMLImageElement>(null);
  const imgUploadRef = useRef<HTMLButtonElement>(null);

  const [BioContent, setBioContent] = useState<string>("");
  const [generateEditProfile, setGenerateEditProfile] =
    useState<GenerateEditProfilePropsType | null>(null);
  const [submitBtnDiabled, setSubmitBtnDisabled] = useState<boolean>(true);
  const [updatedProfileImg, setUpdatedProfileImg] = useState<File | null>(null);

  const { authUser } = useAuthStore();
  const { access_token } = authUser as GenerateAuthDataType;

  const { authorProfileInfo, resetAuthorProfileInfo } = useAuthorProfileStore();
  const {
    personal_info: { username, fullname, profile_img, email, bio },
    social_links,
  } = authorProfileInfo as AuthorProfileStructureType;

  const [socialLinksContent, setSocialLinksContent] = useState(social_links);

  const { GetAuthorProfileInfo } = useUserFetch();
  const { UpdateAuthAvatarImg, UpdateAuthProfileInfo } = useSettingFetch();

  // 監聽 Bio InputBox 內容變化
  const handleBioOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;

    setBioContent(target.value);
  };

  // 根據資料變更，決定是否啟動提交按鈕
  const handleSubmitBtnDisabled = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const formData: { [key: string]: string } = {};

    if (formRef.current && generateEditProfile) {
      // 解析表單內容
      const form = new FormData(formRef.current);

      for (const [key, value] of form.entries()) {
        formData[key] = value.toString();
      }

      setSocialLinksContent(formData);

      // 如果是在提交按鈕已是啟動狀態的前提下，目標表單內容有變更
      // 那就沒有必要檢查表單內容是否有變更，因為有變更就一定要啟動提交按鈕
      // 這樣會比較有效率

      if (
        target.value !== generateEditProfile[target.name as DataTypes] &&
        !submitBtnDiabled
      ) {
        return;
      }

      // 除此之外，如果目標表單內容與原資料一樣，
      // 那就要開始注意其他表單內容是否有變更
      for (const key in formData) {
        if (formData[key] !== generateEditProfile[key as DataTypes]) {
          return setSubmitBtnDisabled(false);
        } else {
          setSubmitBtnDisabled(true);
        }
      }
    }
  };

  // 照片上傳預覽
  const handleImgPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const img = target.files?.[0];

    if (imgDisplayRef.current && img && imgUploadRef.current) {
      imgDisplayRef.current.src = URL.createObjectURL(img);
      imgUploadRef.current.disabled = false;

      setUpdatedProfileImg(img);
    }
  };

  // 上傳照片
  const handleUploadImg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (updatedProfileImg) {
      UpdateAuthAvatarImg({
        imgFile: updatedProfileImg,
        uploadImg_e: e,
        setUpdatedProfileImg,
      });
    }
  };

  // 表單提交及更新
  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 解析表單內容
    const formData: { [key: string]: string } = {};
    const form = new FormData(formRef.current as HTMLFormElement);

    for (const [key, value] of form.entries()) {
      formData[key] = value.toString();
    }

    const {
      username,
      bio,
      facebook,
      github,
      instagram,
      twitter,
      youtube,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username must be at least 3 letters long");
    }

    if (bio.length > BioMaxLength) {
      return toast.error(`Bio should not exceed ${BioMaxLength} characters`);
    }

    UpdateAuthProfileInfo({
      username,
      bio,
      social_links: { facebook, github, instagram, twitter, youtube, website },
      submitBtn_e: e,
    });
  };

  // 第一時間根據 access_token 取得作者資訊
  useEffect(() => {
    if (access_token) {
      GetAuthorProfileInfo(authUser?.username ?? "");

      // 當離開頁面時，即本組件被卸載時，
      // 重置作者資訊
      // 這樣可以避免下次進入頁面時，因為上次的資料殘留而導致錯誤
      return () => {
        resetAuthorProfileInfo();
      };
    }
  }, [access_token]);

  // 初始化編輯資料
  // 為了實現表單內容變更時啟動提交按鈕的功能
  useEffect(() => {
    if (authorProfileInfo) {
      const { facebook, github, instagram, twitter, website, youtube } =
        social_links;

      setGenerateEditProfile({
        username,
        bio,
        facebook,
        github,
        instagram,
        twitter,
        website,
        youtube,
      });

      setBioContent(bio);
    }
  }, [authorProfileInfo]);

  return (
    <AnimationWrapper
      keyValue="edit-profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!authorProfileInfo?._id ? (
        // 如果還沒取得作者資訊，顯示載入中
        <Loader />
      ) : (
        // 如果已經取得作者資訊，顯示編輯頁面
        <div>
          {/* Title */}
          <h1
            className="
              max-md:hidden
              text-xl
              font-medium
              truncate     
            "
          >
            Edit Profile
          </h1>

          <div
            className="
              flex
              flex-col
              items-start
              py-10
              gap-8
              xl:flex-row
              xl:gap-10
              max-xl:items-center
              transition
            "
          >
            {/* Upload Avatar Image */}
            <div
              className="
                flex
                flex-col
                gap-5
                items-center
              "
            >
              {/* Upload Label */}
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="
                  relative
                  group
                  block
                  w-48
                  h-48
                  bg-grey-custom
                  rounded-full
                  overflow-hidden
                "
              >
                {/* Avatar Image */}
                <img ref={imgDisplayRef} src={profile_img} />

                {/* Hover Upload Text */}
                <div
                  className="
                    absolute
                    top-0
                    left-0
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-white-custom
                    bg-black-custom/50
                    opacity-0
                    group-hover:opacity-100
                    cursor-pointer
                    transition
                  "
                >
                  Upload Image
                </div>

                {/* Upload Input */}
                <input
                  type="file"
                  id="uploadImg"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={(e) => handleImgPreview(e)}
                />
              </label>

              {/* Upload Button */}
              <button
                ref={imgUploadRef}
                disabled={Boolean(!updatedProfileImg)}
                onClick={(e) => handleUploadImg(e)}
                className={`
                  px-10
                  transition
                  ${
                    !updatedProfileImg
                      ? `
                         btn-light
                         hover:opacity-100
                       text-grey-dark/50
                        `
                      : `
                         btn-dark
                        `
                  }
                `}
              >
                Upload
              </button>
            </div>

            {/* Edit Input Form */}
            <form ref={formRef} className="w-full">
              {/* Fullname && Email */}
              <div
                className="
                  grid
                  grid-cols-1
                  lg:grid-cols-2
                  lg:gap-5
                "
              >
                {/* Fullname InputBox */}
                <InputBox
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  placeholder="Full Name"
                  icon="fi fi-rr-user"
                  disabled={true}
                />

                {/* Email InputBox */}
                <InputBox
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  placeholder="Email"
                  icon="fi fi-rr-envelope"
                  disabled={true}
                />
              </div>

              {/* Username */}
              <div className="mb-6">
                <InputBox
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  placeholder="Username"
                  icon="fi fi-rr-at"
                  onChange={(e) => handleSubmitBtnDisabled(e)}
                  className="mb-1"
                />

                <p className="text-red-custom/80 font-gelasio">
                  * Note: Username will use to search and will be visible to all
                  users
                </p>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <textarea
                  name="bio"
                  id="bio"
                  maxLength={BioMaxLength}
                  defaultValue={bio}
                  placeholder="Bio"
                  onChange={(e) => {
                    handleBioOnChange(e);
                    handleSubmitBtnDisabled(e);
                  }}
                  className="
                    input-box
                    pl-5
                    h-64
                    lg:h-40
                    resize-none
                    leading-7
                  "
                ></textarea>

                <p
                  className="
                    mt-1 
                    text-sm
                    text-right
                    text-grey-dark
                  "
                >
                  {BioMaxLength - (BioContent.length ?? 0)} characters left
                </p>
              </div>

              {/* Social Links */}
              <div
                className="
                  flex
                  flex-col
                  gap-y-3
                "
              >
                <p className="text-grey-dark">
                  Add your social handles below:{" "}
                </p>

                <div
                  className="
                    lg:grid
                    lg:grid-cols-2
                    gap-x-6
                  "
                >
                  {Object.keys(social_links).map((key, i) => {
                    const link = social_links[key as keyof typeof social_links];

                    return (
                      <InputBox
                        id={i.toString()}
                        key={key}
                        name={key}
                        type="text"
                        value={link}
                        placeholder="https://"
                        content={
                          socialLinksContent &&
                          (socialLinksContent[key as DataTypes] ?? "")
                        }
                        icon={`${
                          key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                        }`}
                        onChange={(e) => handleSubmitBtnDisabled(e)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitBtnDiabled}
                onClick={(e) => handleFormSubmit(e)}
                className={`
                  btn-dark
                  ${
                    submitBtnDiabled &&
                    `
                      btn-dark
                      opacity-10
                      hover:opacity-10
                    `
                  }
                `}
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </AnimationWrapper>
  );
};

export default EditProfilePage;
