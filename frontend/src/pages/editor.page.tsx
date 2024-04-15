/* eslint-disable @typescript-eslint/no-unused-vars */

import { Navigate } from 'react-router-dom';

import BlogEditor from '../components/blog-editor.component';
import PublishEditor from '../components/publish-editor.component';

import useAuthStore from '../states/user-auth.state';
import useEditorBlogStore from '../states/editor-blog.state';

const Editor = () => {
  const { authUser } = useAuthStore();
  const { editorState } = useEditorBlogStore();

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
