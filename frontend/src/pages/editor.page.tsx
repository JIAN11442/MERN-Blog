/* eslint-disable @typescript-eslint/no-unused-vars */

import { Navigate } from 'react-router-dom';
import useAuthStore from '../states/auth.state';
import { useState } from 'react';
import BlogEditor from '../components/blog-editor.component';
import PublishEditor from '../components/publish-editor.component';

const Editor = () => {
  const { authUser } = useAuthStore();
  const [editorState, setEditorState] = useState<string>('editor');

  return (
    <>
      {!authUser?.access_token ? (
        <Navigate to="/signin" />
      ) : editorState === 'editor' ? (
        <BlogEditor />
      ) : (
        <PublishEditor />
      )}
    </>
  );
};

export default Editor;
