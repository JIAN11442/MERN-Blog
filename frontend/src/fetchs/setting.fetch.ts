import axios from "axios";
import toast from "react-hot-toast";

import useToastLoadingStore from "../states/toast-loading.state";
import useAuthStore from "../states/user-auth.state";
import useAuthorProfileStore from "../states/author-profile.state";

import useAwsFetch from "./aws.fetch";

import {
  AuthorProfileStructureType,
  FetchSettingPropsType,
  GenerateAuthDataType,
} from "../commons/types.common";

const useSettingFetch = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const { setToastLoading } = useToastLoadingStore();
  const { authorProfileInfo, setAuthorProfileInfo } = useAuthorProfileStore();

  const { UploadImageToAWS } = useAwsFetch();

  const SETTING_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/setting";

  // 更新用戶密碼
  const UpdateAuthPassword = async ({
    formData,
    form_e,
    currPasswordInputRef,
    newPasswordInputRef,
  }: FetchSettingPropsType) => {
    // 之所以特別將 e.currentTarget 存在 target 變數中，
    // 是因為 e.currentTarget 在執行過程中可能會被清除，比如 catch 時會變成 null
    const target = form_e?.currentTarget;
    const requestURL = SETTING_SERVER_ROUTE + "/change-password";

    // 顯示 Loading
    const toastLoading = toast.loading("Updating...");

    setToastLoading(true);

    // 將按鈕設為不可用，防止用戶多次點擊
    target?.setAttribute("disabled", "true");

    await axios
      .post(requestURL, formData)
      .then(({ data }) => {
        // 如果成功更新，那就關閉 Loading
        toast.dismiss(toastLoading);
        setToastLoading(false);

        // 接著將按鈕設為可用
        target?.removeAttribute("disabled");

        // 清空輸入框
        if (currPasswordInputRef?.current && newPasswordInputRef?.current) {
          currPasswordInputRef.current.value = "";
          newPasswordInputRef.current.value = "";
        }

        // 最後顯示成功訊息
        return toast.success(data.message);
      })
      .catch((error) => {
        // 如果失敗，也一樣要停止 Loading
        toast.dismiss(toastLoading);
        setToastLoading(false);

        // 接著將按鈕恢復可用
        target?.removeAttribute("disabled");

        // 再判斷錯誤的種類
        if (error.response) {
          // 伺服器端返回了錯誤狀態碼
          toast.error(error.response.data.errorMessage);
        } else if (error.request) {
          // 請求發出但沒有收到回應
          console.log(error.request);
          toast.error("Request made but no response received");
        } else {
          // 在設定請求時出現錯誤
          console.log(error.message);
          toast.error("Request setup error: ", error.message);
        }
      });
  };

  // 更新用戶頭像
  const UpdateAuthAvatarImg = async ({
    imgFile,
    uploadImg_e,
    setUpdatedProfileImg,
  }: FetchSettingPropsType) => {
    const target = uploadImg_e?.currentTarget;
    const toastLoading = toast.loading("Uploading...");

    // 另外也要設定 Toast Loading 狀態，
    // 為了讓 toaster 的 duration 不受到 2000ms 的影響
    setToastLoading(true);

    // 將按鈕設為不可用，防止用戶多次點擊
    // 另外也要將按鈕的透明度設為 80%，示意按鈕已被按下
    if (target) {
      target.setAttribute("disabled", "true");
      target.classList.add("opacity-80");
    }

    if (imgFile) {
      // 上傳圖片到 AWS 並取得圖片 URL
      UploadImageToAWS(imgFile).then(async (imgUrl) => {
        // 接著將確定的圖片 URL 上傳到 MongoDB
        const requestURL = SETTING_SERVER_ROUTE + "/change-avatar";

        await axios
          .post(requestURL, { imgUrl })
          .then(({ data }) => {
            if (data) {
              // 更新 zustand 中的用戶資料
              const newAuthUser = {
                ...authUser,
                profile_img: data.imgUrl,
              } as GenerateAuthDataType;

              setAuthUser(newAuthUser);

              // 關閉 Loading
              toast.dismiss(toastLoading);
              setToastLoading(false);

              // 將按鈕設為可用及恢復透明度
              if (target) {
                target.removeAttribute("disabled");
                target.classList.remove("opacity-80");
              }

              // 清空更新的圖片，這樣可以讓 Upload Button 恢復不可上傳的樣式
              setUpdatedProfileImg && setUpdatedProfileImg(null);

              // 最後顯示成功訊息
              toast.success(data.message);
            }
          })
          .catch(({ response }) => {
            // 如果失敗，也一樣要停止 Loading
            toast.dismiss(toastLoading);
            setToastLoading(false);

            // 以及恢復按鈕可用性及透明度
            if (target) {
              target.removeAttribute("disabled");
              target.classList.remove("opacity-80");
            }

            // 清空更新的圖片，這樣可以讓 Upload Button 恢復不可上傳的樣式
            setUpdatedProfileImg && setUpdatedProfileImg(null);

            // 最後顯示錯誤訊息
            console.log(response.data);
            toast.error(response.data.errorMessage);
          });
      });
    }
  };

  // 更新用戶個人資料
  const UpdateAuthProfileInfo = async ({
    username,
    bio,
    social_links,
    submitBtn_e,
  }: FetchSettingPropsType) => {
    const target = submitBtn_e?.currentTarget;
    const toastLoading = toast.loading("Uploading...");

    setToastLoading(true);

    if (target) {
      target.setAttribute("disabled", "true");
      target.classList.add("opacity-80");
    }

    const requestURL = SETTING_SERVER_ROUTE + "/change-profile";

    await axios
      .post(requestURL, { username, bio, social_links })
      .then(async ({ data }) => {
        if (data) {
          // 從 server 返回的 data 中取得更新後的用戶資料
          const {
            username: resUsername,
            bio: resBio,
            social_links: resSocial_links,
          } = await data.result;

          // 更新 zustand 中的用戶資料
          const newAuthorProfileInfo = {
            ...authorProfileInfo,
            personal_info: {
              ...authorProfileInfo?.personal_info,
              username: resUsername,
              bio: resBio,
            },
            social_links: resSocial_links,
          } as AuthorProfileStructureType;

          setAuthorProfileInfo(newAuthorProfileInfo);

          // 關閉 Loading
          toast.dismiss(toastLoading);
          setToastLoading(false);

          // 將按鈕設為可用及恢復透明度
          if (target) {
            target.removeAttribute("disabled");
            target.classList.remove("opacity-80");
          }

          // 最後顯示成功訊息
          toast.success(data.message);
        }
      })
      .catch(({ response }) => {
        // 如果失敗，也一樣要停止 Loading
        toast.dismiss(toastLoading);
        setToastLoading(false);

        // 以及恢復按鈕可用性及透明度
        if (target) {
          target.removeAttribute("disabled");
          target.classList.remove("opacity-80");
        }

        // 最後顯示錯誤訊息
        console.log(response.data);
        toast.error(response.data.errorMessage);
      });
  };

  return { UpdateAuthPassword, UpdateAuthAvatarImg, UpdateAuthProfileInfo };
};

export default useSettingFetch;
