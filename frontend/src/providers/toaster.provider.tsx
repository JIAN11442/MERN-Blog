import { Toaster } from "react-hot-toast";

interface ToasterProviderProps {
  children: React.ReactNode;
}

const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  return (
    <>
      <Toaster
        containerStyle={{ top: "100px" }}
        toastOptions={{
          position: "top-center",
          duration: 2000,
        }}
      />
      {children}
    </>
  );
};

export default ToasterProvider;
