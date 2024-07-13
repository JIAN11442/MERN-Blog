import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../components/loader.component";

import pageNotFoundImageForLightTheme from "../imgs/404-2-light.png";
import pageNotFoundImageForDarkTheme from "../imgs/404-2-dark.png";
import fullLogoForLightTheme from "../imgs/full-logo-light.png";
import fullLogoForDarkTheme from "../imgs/full-logo-dark.png";

import useNavbarStore from "../states/navbar.state";
import useProviderStore from "../states/provider.state";

const PageNotFound = () => {
  const navigate = useNavigate();

  const [imageLoaded, setImageLoaded] = useState(false);

  const { searchBarVisibility } = useNavbarStore();
  const { theme } = useProviderStore();

  const pageNotFoundImage =
    theme === "light"
      ? pageNotFoundImageForLightTheme
      : pageNotFoundImageForDarkTheme;
  const fullLogo =
    theme === "light" ? fullLogoForLightTheme : fullLogoForDarkTheme;

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <section
      className={`
        flex
        flex-col
        min-h-[80vh]
        items-center
        justify-center
        text-center
        gap-5
        ${searchBarVisibility ? "translate-y-[80px] md:translate-y-0" : ""}
      `}
    >
      {/* 404 Image */}
      <img
        src={pageNotFoundImage}
        onLoad={() => setImageLoaded(true)}
        className="select-none min-w-[400px] max-w-[55%]"
      />

      {/* Do not display the text until the image has fully loaded */}
      {!imageLoaded ? (
        <Loader />
      ) : (
        <>
          {/* Navigate text */}
          <p
            className="
              text-xl  
            text-grey-dark
              font-mono
              leading-7
              -mt-10  
            "
          >
            The page you are looking for does not exists. Please head back to
            the{" "}
            <Link
              to="/"
              onClick={(e) => handleGoBack(e)}
              className="text-blue-600 underline"
            >
              previous page
            </Link>{" "}
            OR{" "}
            <Link to="/" className="text-blue-600 underline">
              home page
            </Link>
          </p>

          {/* Full logo */}
          <div className="absolute bottom-0 py-10">
            <img
              src={fullLogo}
              className="h-7 object-contain block mx-auto select-none"
            />
            <p className="mt-3 text-grey-dark">
              Read millions of stories around the world
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default PageNotFound;
