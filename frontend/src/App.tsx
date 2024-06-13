import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/navbar.component";

import UserAuthPage from "./pages/auth.page";
import Editor from "./pages/editor.page";
import Homepage from "./pages/home.page";
import useAuthFetch from "./fetchs/auth.fetch";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNavbar from "./components/side-navbar.component";
import ChangePasswordPage from "./pages/change-password.page";

function App() {
  const { GetAuthUserWithToken } = useAuthFetch();

  useEffect(() => {
    // 每一次刷新都會重新檢查使用者的登入狀態
    GetAuthUserWithToken();
  }, []);

  return (
    <Routes>
      <Route path="editor" element={<Editor />} />
      <Route path="editor/:blogId" element={<Editor />} />
      <Route path="/" element={<Navbar />}>
        {/* index 為 true 的路由 route 將預設為父路由下的子路由，建議只指定一個*/}
        <Route index element={<Homepage />} />

        <Route path="settings" element={<SideNavbar />}>
          <Route
            path="edit-profile"
            element={<h1>This is a edit profile page</h1>}
          />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="signin" element={<UserAuthPage type="sign-in" />} />
        <Route path="signup" element={<UserAuthPage type="sign-up" />} />
        <Route path="search/:query" element={<SearchPage />} />
        <Route path="user/:authorId" element={<ProfilePage />} />
        <Route path="blog/:blogId" element={<BlogPage />} />

        {/* 如果當前的路徑都不是上面那些，就會來到這頁 */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
