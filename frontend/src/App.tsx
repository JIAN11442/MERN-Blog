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
import OfflinePage from "./pages/offline.page";
import BlogManagementPage from "./pages/blog-management.page";
import AuthorManagementPage from "./pages/author-management.page";

import useProviderStore from "./states/provider.state";

import useAuthFetch from "./fetchs/auth.fetch";

function App() {
  const { isOnline } = useProviderStore();

  const { GetAuthUserWithToken } = useAuthFetch();

  useEffect(() => {
    // 每一次刷新都會重新檢查使用者的登入狀態
    GetAuthUserWithToken();

    // document.body.style.zoom = "95%";
  }, []);

  return (
    <Routes>
      {isOnline ? (
        <>
          <Route path="editor" element={<BlogEditorPage />} />
          <Route path="editor/:blogId" element={<BlogEditorPage />} />

          <Route path="/" element={<Navbar />}>
            <Route index element={<Homepage />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<SideNavbar />}>
              <Route path="notifications" element={<NotificationPage />} />
              <Route path="blogs" element={<BlogManagementPage />} />
              <Route path="friends" element={<AuthorManagementPage />} />
            </Route>

            {/* Settings route */}
            <Route path="settings" element={<SideNavbar />}>
              <Route path="edit-profile" element={<EditProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* Auth route */}
            <Route path="signin" element={<UserAuthPage type="sign-in" />} />
            <Route path="signup" element={<UserAuthPage type="sign-up" />} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="user/:authorId" element={<ProfilePage />} />
            <Route path="blog/:blogId" element={<BlogPage />} />

            {/* 如果當前的路徑都不是上面那些，就會來到這頁 */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </>
      ) : (
        <Route path="*" element={<OfflinePage />} />
      )}
    </Routes>
  );
}

export default App;
