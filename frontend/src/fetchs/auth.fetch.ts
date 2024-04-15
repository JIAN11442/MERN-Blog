import axios from 'axios';
import toast from 'react-hot-toast';

import useAuthStore from '../states/user-auth.state';
import { authWithGoogleUsingPopUp } from '../commons/firebase.common';

const AUTH_SERVER_ROUTE = import.meta.env.VITE_SERVER_DOMAIN + '/auth';

const useAuthFetch = () => {
  const requestUrl = AUTH_SERVER_ROUTE + '/authentication';
  const { setAuthUser } = useAuthStore();

  // Fetch Authenticated User with Google Auth（sign in）
  const SignInWithGoogleAuth = async (
    e: React.FormEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    authWithGoogleUsingPopUp()
      .then((googleAuthUser) => {
        if (googleAuthUser) {
          const serverRoute = '/auth/google-auth';
          const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + serverRoute;
          const formData = {
            google_access_token: (googleAuthUser as { accessToken?: string })
              ?.accessToken,
          };
          SignInOrSignUpWithServer(requestUrl, formData);
        }
      })
      .catch((error) => {
        toast.error('trouble login through google');
        return console.log(error);
      });
  };

  // Fetch Authenticated User with Server（ sign in | sign up ）
  const SignInOrSignUpWithServer = (requestUrl: string, formData: object) => {
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

  // Fetch Authenticated User with Token（get user with bearer token）
  const GetAuthUserWithToken = () => {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${sessionStorage.getItem('access_token')}`;

    axios
      .get(requestUrl)
      .then(({ data }) => {
        if (data.user) {
          setAuthUser(data.user);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  return {
    GetAuthUserWithToken,
    SignInOrSignUpWithServer,
    SignInWithGoogleAuth,
  };
};

export default useAuthFetch;
