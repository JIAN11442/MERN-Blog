import useBase64Image from "../imgs/Base64/base64.img";

const OfflinePage = () => {
  // const network =
  //   "https://mern-blogging-yt.s3.ap-southeast-1.amazonaws.com/yhB6TXVcK_UTaFn6Dsv8_-1720441417899.jpeg";
  // const img =
  //   "https://mern-blogging-yt.s3.ap-southeast-1.amazonaws.com/DiS2iXQGdhW7ugXJn_3vL-1720440644045.jpeg";

  const { networkImg, offlineImg } = useBase64Image();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          flex
          flex-col
          gap-10
          items-center
          justify-center
          text-center
        "
      >
        {/* Image */}
        <img
          rel="preload"
          src={networkImg}
          className="
            max-w-[10%]
            ml-9
            -mb-12
          "
        />
        <img
          src={offlineImg}
          rel="preload"
          className="select-none min-w-[400px] max-w-[70%]"
        />

        {/* Text */}
        <div
          className="
            flex
            flex-col
            gap-5
          "
        >
          <h1
            className="
              text-[2rem]
              font-semibold
            "
          >
            Connect to the internet
          </h1>
          <p>You're offline. Please check your connection</p>
        </div>

        {/* Button */}
        <button
          onClick={handleReload}
          className="
            btn-dark
          "
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;
