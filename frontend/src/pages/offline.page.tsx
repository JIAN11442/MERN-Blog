import useBase64Image from "../imgs/Base64/base64.img";
import useProviderStore from "../states/provider.state";

const OfflinePage = () => {
  const { theme } = useProviderStore();

  const { offlineImgForDarkTheme, offlineImgForLightTheme } = useBase64Image();
  const offlineImg =
    theme === "dark" ? offlineImgForDarkTheme : offlineImgForLightTheme;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className="
        fixed
        inset-0
        flex
        flex-col
        items-center
        justify-center
      "
    >
      <img
        src={offlineImg}
        className="
          -mt-20
          select-none
          max-w-[450px]
          max-h-[450px]
        "
      />

      {/* Text */}
      <div
        className="
          flex
          flex-col
          gap-5
          -mt-20
          mb-5
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
  );
};

export default OfflinePage;
