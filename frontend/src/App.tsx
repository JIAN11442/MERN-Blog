import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/navbar.component';

import UserAuthPage from './pages/auth.page';
import Editor from './pages/editor.page';
import Homepage from './pages/home.page';
import useAuthFetch from './fetchs/auth.fetch';

function App() {
  const { GetAuthUserWithToken } = useAuthFetch();

  // 每一次刷新都會重新檢查使用者的登入狀態
  useEffect(() => {
    GetAuthUserWithToken();
  }, []);

  return (
    <Routes>
      <Route path="/editor" element={<Editor />} />
      <Route path="/" element={<Navbar />}>
        {/* index 為 true 的路由 route 將預設為父路由下的子路由，建議只指定一個*/}
        <Route index element={<Homepage />} />
        <Route path="/signin" element={<UserAuthPage type="sign-in" />} />
        <Route path="/signup" element={<UserAuthPage type="sign-up" />} />
      </Route>
    </Routes>
  );
}

export default App;
