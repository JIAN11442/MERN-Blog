import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/navbar.component';

import UserAuthPage from './pages/auth.page';
import Editor from './pages/editor.page';
import Homepage from './pages/home.page';
import useAuthFetch from './fetchs/auth.fetch';
import SearchPage from './pages/search.page';
import useHomeBlogStore from './states/home-blog.state';
import PageNotFound from './pages/404.page';
import AuthorProfilePage from './pages/author-profile.page';

function App() {
  const { GetAuthUserWithToken } = useAuthFetch();
  const { setScrollbarVisible } = useHomeBlogStore();

  useEffect(() => {
    // 每一次刷新都會重新檢查使用者的登入狀態
    GetAuthUserWithToken();

    // 檢查滾動條是否顯示(爲了控制返回頂部按鈕的顯示與隱藏)
    const checkScroll = () => {
      if (window.scrollY >= 1 && window.scrollbars.visible) {
        setScrollbarVisible(true);
      } else {
        setScrollbarVisible(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  return (
    <Routes>
      <Route path="/editor" element={<Editor />} />
      <Route path="/" element={<Navbar />}>
        {/* index 為 true 的路由 route 將預設為父路由下的子路由，建議只指定一個*/}
        <Route index element={<Homepage />} />
        <Route path="signin" element={<UserAuthPage type="sign-in" />} />
        <Route path="signup" element={<UserAuthPage type="sign-up" />} />
        <Route path="search/:query" element={<SearchPage />} />
        <Route path="user/:authorId" element={<AuthorProfilePage />} />

        {/* 如果當前的路徑都不是上面那些，就會來到這頁 */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
