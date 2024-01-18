import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import googleIcon from '../imgs/google.png';

import InputBox from '../components/inputbox.component';
import AniamationWrapper from '../commons/page-animation.common';

interface UserAuthFormProps {
  type: string;
}

interface FormDataType {
  fullname?: string;
  email: string;
  password: string;
}

const UserAuthForm: React.FC<UserAuthFormProps> = ({ type }) => {
  const userAuthThroughServer = async (
    serverRoute: string,
    formData: FormDataType
  ) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
        formData
      );

      if (res) {
        console.log(res.data);
        toast.success('Success');
      }
    } catch (error) {
      const errResponse = error as Error;
      console.log(errResponse);
      toast.error(`${errResponse.name}: ${errResponse.message}`);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const serverRoute = location.pathname;

    // 預防表單送出
    e.preventDefault();

    // 取得表單資料
    const form = new FormData(
      document.getElementById('authForm') as HTMLFormElement
    );
    const formData = {} as FormDataType;

    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') {
        formData[key as keyof FormDataType] = value;
      }
    }

    const { fullname, email, password } = formData;
    const emailRegex =
      /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*(\.[A-Za-z]+)+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // validate fullname, email, password
    if (fullname) {
      if (!fullname || !email || !password) {
        return toast.error('Parameters missing');
      }
    } else {
      if (!email || !password) {
        return toast.error('Parameters missing');
      }
    }

    if (fullname && fullname.length < 3) {
      return toast.error('Fullname must be at least 3 letters long');
    }

    if (!emailRegex.test(email)) {
      return toast.error('Email is invalid');
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        'Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters'
      );
    }

    // send request to server
    userAuthThroughServer(serverRoute, formData);
  };

  return (
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
        <form id="authForm" className="w-[80%] max-w-[400px]">
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
            id="fullname"
            type="text"
            name="fullname"
            placeholder="Fullname"
            icon="fi fi-rr-user"
            className={`${type !== 'sign-in' ? 'flex' : 'hidden'}`}
          />

          {/* Email InputBox */}
          <InputBox
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            icon="fi fi-rr-at"
          />

          {/* Password InputBox */}
          <InputBox
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            icon="fi fi-rr-key"
          />

          {/* Submit Button */}
          <button
            onClick={(e) => handleSubmit(e)}
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
                  mt-6
                  text-xl
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
                    text-xl
                    ml-2
                  "
                >
                  Join us today.
                </Link>
              </p>
            ) : (
              <p
                className="
                  mt-6
                  text-xl
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
                    text-xl
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
