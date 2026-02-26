import { useNetInfo } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const netInfo = useNetInfo();

  return {
    isConnected: netInfo.isConnected,
    isInternetReachable: netInfo.isInternetReachable,
  };
};
