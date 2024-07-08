import { useEffect } from "react";
import useProviderStore from "../states/provider.state";

interface ScrollProviderProps {
  children?: React.ReactNode;
}

const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const { setScrollbarVisible } = useProviderStore();

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY >= 1 && window.scrollbars.visible) {
        setScrollbarVisible({ visible: true, position: window.scrollY });
      } else {
        setScrollbarVisible({ visible: false, position: window.scrollY });
      }
    };

    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  return <div>{children}</div>;
};

export default ScrollProvider;
