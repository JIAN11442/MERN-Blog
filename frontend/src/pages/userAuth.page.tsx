import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import googleIcon from '../imgs/google.png';

import InputBox from '../components/input-box.component';

import useAuthStore from '../states/auth.state';

import AniamationWrapper from '../commons/page-animation.common';
import { authWithGoogleUsingPopUp } from '../commons/firebase.common';

interface UserAuthFormProps {
  type: string;
}

const UserAuthForm: React.FC<UserAuthFormProps> = ({ type }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
  });
  const { authUser, setAuthUser } = useAuthStore();
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Through server to authenticate user
  const userAuthThroughServer = (requestUrl: string, formData: object) => {
    axios
      .post(requestUrl, formData)
      .then(({ data }) => {
        if (data.message && data.user) {
          sessionStorage.setItem('access_token', data.user.access_token);
          setAuthUser(data.user);
          toast.success(data.message);
        }
      })
      .catch((error) => {
        if (error.response) {
          // 伺服器端返回了錯誤狀態碼
          toast.error(error.response.data.errorMessage);
        } else if (error.request) {
          // 請求發出但沒有收到回應
          console.log(error.request);
          toast.error('Request made but no response received');
        } else {
          // 在設定請求時出現錯誤
          console.log(error.message);
          toast.error('Request setup error: ', error.message);
        }
      });
  };

  // Handle Google Auth
  const handleGoogleAuth = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    authWithGoogleUsingPopUp()
      .then((user) => {
        if (user) {
          const serverRoute = '/google-auth';
          const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + serverRoute;
          const formData = {
            access_token: (user as { accessToken?: string })?.accessToken,
          };
          userAuthThroughServer(requestUrl, formData);
        }
      })
      .catch((error) => {
        toast.error('trouble login through google');
        return console.log(error);
      });
  };

  // Handle login or signup with input values
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 取得表單送出的路由
    const serverRoute = location.pathname;

    // 預防表單送出
    const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + serverRoute;

    // 透過 axios 送出表單資料
    userAuthThroughServer(requestUrl, formData);
  };

  return authUser ? (
    <Navigate to="/" />
  ) : (
    <AniamationWrapper
      keyValue={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
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
              mb-24
            "
          >
            {type === 'sign-in' ? 'Welcome back' : 'Join us today'}
          </h1>

          {/* Username InputBox */}
          <InputBox
            type="text"
            id="fullname"
            name="fullname"
            placeholder="Fullname"
            onChange={(e) => handleInput(e)}
            icon="fi fi-rr-user"
            className={`${type !== 'sign-in' ? 'flex' : 'hidden'}`}
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
              mt-14
            "
          >
            {type.replace('-', ' ')}
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
            <p>or</p>
            <hr className="w-1/2 border-black-custom" />
          </div>

          {/* Other Options */}
          <button
            onClick={handleGoogleAuth}
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
            {type === 'sign-in' ? (
              <p
                className="
                  mt-10
                  text-lg
                  text-grey-dark
                  text-center
                "
              >
                Don't have a account ?
                <Link
                  to="/signup"
                  className="
                    underline
                    text-grey-dark
                    text-lg
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
                  text-lg
                  text-grey-dark
                  text-center
                "
              >
                Already a member ?
                <Link
                  to="/signin"
                  className="
                    underline
                    text-grey-dark
                    text-lg
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
    </AniamationWrapper>
  );
};

export default UserAuthForm;
