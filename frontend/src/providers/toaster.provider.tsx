import { Toaster } from 'react-hot-toast';
// import useEditorBlogStore from '../states/blog.state';

interface ToasterProviderProps {
  children: React.ReactNode;
}

const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  // const { editorState } = useEditorBlogStore();
  return (
    <>
      <Toaster
        // containerStyle={{
        //   top: `${editorState === 'publish' ? '20px' : '100px'}`,
        // }}
        toastOptions={{
          position: 'top-center',
          duration: 2000,
        }}
      />
      {children}
    </>
  );
};

export default ToasterProvider;
