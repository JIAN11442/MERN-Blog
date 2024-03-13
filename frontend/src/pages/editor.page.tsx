import { Navigate } from 'react-router-dom';
import useAuthStore from '../states/auth.state';

const Editor = () => {
  const { authUser } = useAuthStore();

  return (
    <>
      {!authUser?.access_token ? (
        <Navigate to="/signin" />
      ) : (
        <h1>You can access to editor page</h1>
      )}
    </>
  );
};

export default Editor;
