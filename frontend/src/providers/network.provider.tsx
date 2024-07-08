import { useEffect } from "react";
import useProviderStore from "../states/provider.state";

interface NetworkMonitorProps {
  children?: React.ReactNode;
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ children }) => {
  const { setIsOnline, isOnline } = useProviderStore();

  // 監測網路狀態
  useEffect(() => {
    const checkAndSetNetworkState = () => {
      setIsOnline(navigator.onLine);
    };

    checkAndSetNetworkState();

    window.addEventListener("online", checkAndSetNetworkState);
    window.addEventListener("offline", checkAndSetNetworkState);

    return () => {
      window.removeEventListener("online", checkAndSetNetworkState);
      window.removeEventListener("offline", checkAndSetNetworkState);
    };
  }, [isOnline]);

  return <div>{children}</div>;
};

export default NetworkMonitor;
