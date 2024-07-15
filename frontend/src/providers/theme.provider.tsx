import { useEffect } from "react";
import useProviderStore from "../states/provider.state";

interface ThemeProviderProps {
  children?: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // window.matchMedia 是一個可以檢查瀏覽器是否符合特定媒體查詢的 API
  // 而我們這裡使用它來檢查使用者的主題偏好，即 prefers-color-scheme 是否為 dark
  // 這樣我們就可以在使用者的瀏覽器設定為 dark 時，第一時間套用對應的 dark theme
  const darkThemePreference = () =>
    window.matchMedia("(prefers-color-scheme: dark").matches;

  const { setTheme } = useProviderStore();

  useEffect(() => {
    const themeInStrorage = sessionStorage.getItem("theme");
    const state = themeInStrorage
      ? themeInStrorage
      : darkThemePreference()
      ? "dark"
      : "light";

    document.body.classList.add(`${state}`);

    setTheme(state);
  }, []);

  return <div>{children}</div>;
};

export default ThemeProvider;
