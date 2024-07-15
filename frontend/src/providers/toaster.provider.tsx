import { Toaster } from "react-hot-toast";
import useProviderStore from "../states/provider.state";
// import useEditorBlogStore from '../states/blog.state';

interface ToasterProviderProps {
  children: React.ReactNode;
}

const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  // const { editorState } = useEditorBlogStore();
  const { toastLoading, theme } = useProviderStore();
  return (
    <>
      <Toaster
        toastOptions={{
          position: "top-center",
          duration: toastLoading ? undefined : 2000, //除了 loading 之外的 toast 2 秒後消失
          style: {
            background: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#333",
          },
        }}
        // containerStyle={{
        //   top: `${editorState === 'publish' ? '20px' : '100px'}`,
        // }}
      />
      {children}
    </>
  );
};

export default ToasterProvider;
