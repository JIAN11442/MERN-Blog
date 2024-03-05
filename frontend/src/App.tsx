import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/navbar.component';
import UserAuthForm from './pages/userAuthForm.page';
import useAuthStore from './states/auth.state';

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
          setAuthUser(data.user);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="/editor" element={<h1>Editor page</h1>} />
        <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
        <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
      </Route>
    </Routes>
  );
}

export default App;
