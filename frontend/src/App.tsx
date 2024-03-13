import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/navbar.component';

import useAuthStore from './states/auth.state';

import UserAuth from './pages/userAuth.page';
import Editor from './pages/editor.page';

function App() {
  const { setAuthUser } = useAuthStore();

  axios.defaults.withCredentials = true;
  axios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${sessionStorage.getItem('access_token')}`;

  useEffect(() => {
    const requestUrl = import.meta.env.VITE_SERVER_DOMAIN + '/authentication';

    axios
      .get(requestUrl)
      .then(({ data }) => {
        if (data.user) {
          console.log(data.user);
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
        <Route path="/signin" element={<UserAuth type="sign-in" />} />
        <Route path="/signup" element={<UserAuth type="sign-up" />} />
      </Route>
    </Routes>
  );
}

export default App;
