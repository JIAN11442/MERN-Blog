import axios from "axios";
import toast from "react-hot-toast";

import { FetchSettingPropsType } from "../commons/types.common";

const useSettingFetch = () => {
  const SETTING_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + "/setting";

  // 更新用戶密碼
  const UpdateAuthPassword = async ({
    formData,
    e,
    currPasswordInputRef,
    newPasswordInputRef,
  }: FetchSettingPropsType) => {
    // 之所以特別將 e.currentTarget 存在 target 變數中，
    // 是因為 e.currentTarget 在執行過程中可能會被清除，比如 catch 時會變成 null
    const target = e?.currentTarget;
    const requestURL = SETTING_SERVER_ROUTE + "/change-password";

    // 顯示 Loading
    const toastLoading = toast.loading("Updating...");

    // 將按鈕設為不可用，防止用戶多次點擊
    target?.setAttribute("disabled", "true");

    await axios
      .post(requestURL, formData)
      .then(({ data }) => {
        // 如果成功更新，那就關閉 Loading
        toast.dismiss(toastLoading);

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

  return { UpdateAuthPassword };
};

export default useSettingFetch;
