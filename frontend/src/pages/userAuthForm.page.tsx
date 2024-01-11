import { Link } from "react-router-dom";

import googleIcon from "../imgs/google.png";

import InputBox from "../components/inputbox.component";
import AniamationWrapper from "../commons/page-animation.common";

interface UserAuthFormProps {
  type: string;
}

const UserAuthForm: React.FC<UserAuthFormProps> = ({ type }) => {
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
        <form className="w-[80%] max-w-[400px]">
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
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>

          {/* Username InputBox */}
          <InputBox
            id="username"
            type="text"
            name="username"
            placeholder="Username"
            icon="fi fi-rr-user"
            className={`${type !== "sign-in" ? "flex" : "hidden"}`}
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
            type="submit"
            className="
              btn-dark
              center
              mt-14
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
            {type === "sign-in" ? (
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
