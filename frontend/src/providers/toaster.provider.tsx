import { Toaster } from "react-hot-toast";
import useToastLoadingStore from "../states/provider.state";
// import useEditorBlogStore from '../states/blog.state';

interface ToasterProviderProps {
  children: React.ReactNode;
}

const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  // const { editorState } = useEditorBlogStore();
  const { toastLoading } = useToastLoadingStore();
  return (
    <>
      <Toaster
        // containerStyle={{
        //   top: `${editorState === 'publish' ? '20px' : '100px'}`,
        // }}
        toastOptions={{
          position: "top-center",
          duration: toastLoading ? undefined : 2000, //除了 loading 之外的 toast 2 秒後消失
        }}
      />
      {children}
    </>
  );
};

export default ToasterProvider;
