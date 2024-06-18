import { useRef } from "react";

import InputBox from "../components/input-box.component";
import AnimationWrapper from "../components/page-animation.component";

import useSettingFetch from "../fetchs/setting.fetch";

const ChangePasswordPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const currPasswordInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);

  const { UpdateAuthPassword } = useSettingFetch();

  // 更改密碼
  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 與 auth.page 取得資料的方式不一樣
    // auth.page 是利用每個 input 的 onChange 事件不斷更新 useState 的 fromData 值
    // 而這裏是利用 formRef.current 建立 FormData 物件，再透過 entries() 取得表單的 key-value pair
    // 可以互相比較兩者的差異

    const formData: { [key: string]: string } = {};

    if (formRef.current) {
      const form = new FormData(formRef.current);

      for (const [key, value] of form.entries()) {
        formData[key] = value.toString();
      }

      UpdateAuthPassword({
        formData,
        form_e: e,
        currPasswordInputRef,
        newPasswordInputRef,
      });
    }
  };

  return (
    <AnimationWrapper
      key="change-password-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form ref={formRef}>
        {/* Title */}
        <h1
          className="
            max-md:hidden
            text-xl
            font-medium
            truncate     
          "
        >
          Change Password
        </h1>

        {/* Input */}
        <div
          className="
            w-full
            md:py-10
            md:max-w-[400px]
          "
        >
          {/* Current password input */}
          <InputBox
            ref={currPasswordInputRef}
            type="password"
            id="currPassword"
            name="currPassword"
            placeholder="Current Password"
            icon="fi fi-rr-key"
          />

          {/* New password input */}
          <InputBox
            ref={newPasswordInputRef}
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="New Password"
            icon="fi fi-rr-key"
          />

          {/* Submit Button */}
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            className="
              btn-dark
              px-10
            "
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};
1;
export default ChangePasswordPage;
