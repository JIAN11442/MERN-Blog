import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/navbar.component";

import useAuthStore from "./states/user-auth.state";

import UserAuthPage from "./pages/auth.page";
import Editor from "./pages/editor.page";
import Homepage from "./pages/home.page";

function App() {
  const { setAuthUser } = useAuthStore();

  axios.defaults.withCredentials = true;
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${sessionStorage.getItem("access_token")}`;

  useEffect(() => {
    const requestUrl =
      import.meta.env.VITE_SERVER_DOMAIN + "/auth/authentication";

    axios
      .get(requestUrl)
      .then(({ data }) => {
        if (data.user) {
          setAuthUser(data.user);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }, [setAuthUser]);

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
