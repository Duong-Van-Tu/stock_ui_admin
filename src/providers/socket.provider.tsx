'use client';

import useWebSocket from '@/hooks/socket.hook';
import { appEnvs } from '@/utils/env-mapper';
import { createContext, ReactNode } from 'react';

type SocketProviderProps = {
  children: ReactNode;
};

type ISocketContext = {
  resFromWS: MessageProps;
  sendMessage: (message: string) => void;
  watchList: WatchListItem[];
  setWatchList: (symbol: string) => void;
};

export const SocketContext = createContext<ISocketContext>({
  resFromWS: { realtime: [], info: [] },
  sendMessage: () => {},
  watchList: [],
  setWatchList: () => {}
});

const SocketProvider = ({ children }: SocketProviderProps) => {
  const { sendMessage, resFromWS, setSymbolToWatchList, watchList } =
    useWebSocket(appEnvs.default.socketHost || 'http://localhost');

  return (
    <SocketContext.Provider
      value={{
        sendMessage,
        resFromWS,
        watchList,
        setWatchList: setSymbolToWatchList
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
