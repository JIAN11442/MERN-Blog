import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/navbar.component";
import SideNavbar from "./components/side-navbar.component";

import UserAuthPage from "./pages/auth.page";
import BlogEditorPage from "./pages/blog-editor.page";
import Homepage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import ChangePasswordPage from "./pages/change-password.page";
import EditProfilePage from "./pages/edit-profile.page";
import NotificationPage from "./pages/notification.page";

import useAuthFetch from "./fetchs/auth.fetch";

function App() {
  const { GetAuthUserWithToken } = useAuthFetch();

  useEffect(() => {
    // 每一次刷新都會重新檢查使用者的登入狀態
    GetAuthUserWithToken();
  }, []);

  return (
    <Routes>
      <Route path="editor" element={<BlogEditorPage />} />
      <Route path="editor/:blogId" element={<BlogEditorPage />} />
      <Route path="/" element={<Navbar />}>
        {/* index 為 true 的路由 route 將預設為父路由下的子路由，建議只指定一個*/}
        <Route index element={<Homepage />} />

        <Route path="dashboard" element={<SideNavbar />}>
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        {/* Settings route */}
        <Route path="settings" element={<SideNavbar />}>
          <Route path="edit-profile" element={<EditProfilePage />} />
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
