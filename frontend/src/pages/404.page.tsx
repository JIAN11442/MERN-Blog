import { Link } from 'react-router-dom';

import pageNotFoundImage from '../imgs/404-2.png';
import fullLogo from '../imgs/full-logo.png';

import useCollapseStore from '../states/collapse.state';

const PageNotFound = () => {
  const { searchBarVisibility } = useCollapseStore();

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
        ${searchBarVisibility ? 'translate-y-[80px] md:translate-y-0' : ''}
      `}
    >
      {/* 404 Image */}
      <img
        src={pageNotFoundImage}
        className="select-none min-w-[400px] max-w-[55%]"
      />

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
        The page you are looking for does not exists. Please head back to the{' '}
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
    </section>
  );
};

export default PageNotFound;
