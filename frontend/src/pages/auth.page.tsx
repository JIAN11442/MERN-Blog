import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import googleIcon from "../imgs/google.png";

import InputBox from "../components/input-box.component";

import useAuthStore from "../states/user-auth.state";
import useAuthFetch from "../fetchs/auth.fetch";

import AnimationWrapper from "../components/page-animation.component";

interface UserAuthFormProps {
  type: string;
}

const UserAuthPage: React.FC<UserAuthFormProps> = ({ type }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { authUser } = useAuthStore();
  const { SignInOrSignUpWithServer, SignInWithGoogleAuth } = useAuthFetch();

  // Handle input value change
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login or signup with input values
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 取得表單送出的路由
    const serverRoute = `/auth/${location.pathname}`;

    // 預防表單送出
    const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + serverRoute;

    // 透過 axios 送出表單資料
    SignInOrSignUpWithServer(requestUrl, formData);
  };

  return authUser ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper
      keyValue={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section
        className="
          flex
          h-cover
          items-center
          justify-center
        "
      >
        <form onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
          {/* Title */}
          <h1
            className="
              text-4xl
              font-gelasio
              font-semibold
              capitalize
              text-center
              py-5
            "
          >
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>

          {/* Username InputBox */}
          <InputBox
            type="text"
            id="fullname"
            name="fullname"
            placeholder="Fullname"
            onChange={(e) => handleInput(e)}
            icon="fi fi-rr-user"
            className={`${type !== "sign-in" ? "flex" : "hidden"}`}
          />

          {/* Email InputBox */}
          <InputBox
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            onChange={(e) => handleInput(e)}
            icon="fi fi-rr-at"
          />

          {/* Password InputBox */}
          <InputBox
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            onChange={(e) => handleInput(e)}
            icon="fi fi-rr-key"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="
              btn-dark
              center
              mt-10
            "
          >
            {type.replace("-", " ")}
          </button>

          {/* Separate Line */}
          <div
            className="
              relative
              flex  
              w-full
              items-center
              gap-2
              my-10
              opacity-10
              uppercase
              text-black
              font-bold
            "
          >
            <hr className="w-1/2 border-black-custom" />
            <p className="text-black-custom">or</p>
            <hr className="w-1/2 border-black-custom" />
          </div>

          {/* Other Options */}
          <button
            onClick={SignInWithGoogleAuth}
            className="
              btn-dark
              flex
              gap-4
              items-center
              justify-center
              w-[90%]
              center
            "
          >
            <img src={googleIcon} className="w-5" />
            <p>continue with google</p>
          </button>

          {/* Navigation */}
          <div>
            {type === "sign-in" ? (
              <p
                className="
                  mt-10
                  text-grey-dark/50
                  text-center
                "
              >
                Don't have a account ?
                <Link
                  to="/signup"
                  className="
                    underline
                    text-blue-custom
                    ml-2
                  "
                >
                  Join us today.
                </Link>
              </p>
            ) : (
              <p
                className="
                  mt-10
                  text-grey-dark/50
                  text-center
                "
              >
                Already a member ?
                <Link
                  to="/signin"
                  className="
                    underline
                    text-blue-custom
                    ml-2
                  "
                >
                  Sign in here.
                </Link>
              </p>
            )}
          </div>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthPage;
