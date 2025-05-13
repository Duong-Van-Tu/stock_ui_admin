import { useCallback, useEffect, useState } from 'react';

const useWebSocket = (url: string) => {
  const [resFromWS, setResFromWS] = useState<IMessageProps>({
    info: [],
    realtime: []
  });

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [watchList, setWatchList] = useState<IWatchListItem[]>([]);

  // Wait until ws is open
  const waitForConnection = useCallback(
    (callback: () => void, interval = 1000) => {
      if (ws?.readyState === WebSocket.OPEN) {
        callback();
      } else {
        setTimeout(() => {
          waitForConnection(callback, interval);
        }, interval);
      }
    },
    [ws]
  );

  const sendMessage = useCallback(
    (message: any) => {
      const generatedMessage = JSON.stringify(message);
      waitForConnection(() => {
        ws?.send(generatedMessage);
      }, 1000);
    },
    [waitForConnection, ws]
  );

  const setSymbolToWatchList = useCallback((symbol: string) => {
    setWatchList((prev) => {
      const exists = prev.some((item) => item.symbol === symbol);
      if (exists) return prev;

      return [...prev, { symbol, isWatching: false }];
    });
  }, []);

  // WebSocket init
  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResFromWS((prev) => {
        if (data.type === 'info') {
          return {
            ...prev,
            info: [...prev.info, data]
          };
        }

        if (data.type === 'realtime') {
          const updatedRealtime = [...prev.realtime];
          const symbolInfo = data.message;
          const index = updatedRealtime.findIndex(
            (item) => item.symbol === symbolInfo.symbol
          );

          if (index === -1) {
            updatedRealtime.push(symbolInfo);
          } else {
            updatedRealtime[index] = symbolInfo;
          }

          return {
            ...prev,
            realtime: updatedRealtime
          };
        }

        return prev;
      });
    };

    return () => {
      socket.close();
    };
  }, [url]);

  useEffect(() => {
    setWatchList((prev) => {
      const updated = prev.map((item) => {
        if (!item.isWatching) {
          sendMessage({ action: 'subscribe', symbol: item.symbol });
          return { ...item, isWatching: true };
        }
        return item;
      });
      return updated;
    });
  }, [sendMessage]);

  return {
    resFromWS,
    sendMessage,
    ws,
    watchList,
    setSymbolToWatchList
  };
};

export default useWebSocket;
