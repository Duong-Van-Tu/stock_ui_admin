import { useCallback, useEffect, useState } from 'react';

export interface IMessageProps {
  info: object[];
  realtime: StockWithPrice[];
}

export interface IWatchListItem {
  symbol: string;
  isWatching: boolean;
}

const useWebSocket = (url: string) => {
  const [resFromWS, setResFromWS] = useState<IMessageProps>({
    info: [],
    realtime: []
  });
  const [ws, setWs] = useState<WebSocket>();
  const [watchList, setWatchList] = useState<IWatchListItem[]>([]);

  const waitForConnection = useCallback(
    (callback: () => void, interval: number) => {
      if (ws?.readyState === 1) {
        callback();
      } else {
        setTimeout(() => {
          waitForConnection(callback, interval);
        }, interval);
      }
    },
    [ws]
  );

  const setSymbolToWatchList = useCallback(
    (symbol: string) => {
      const isExists =
        watchList.findIndex((itm) => itm.symbol === symbol) !== -1;
      if (!isExists) {
        setWatchList((prev) => [...prev, { symbol, isWatching: false }]);
      }
    },
    [watchList]
  );

  const sendMessage = useCallback(
    (message: any) => {
      const generatedMessage = JSON.stringify(message);
      waitForConnection(() => {
        ws?.send(generatedMessage);
      }, 10000);
    },
    [ws]
  );

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setResFromWS((prevRes) => {
        let newRes = prevRes;
        if (data.type === 'info') {
          prevRes.info.push(data);
        } else if (data.type === 'realtime') {
          const symbolInfo = data.message;
          if (symbolInfo) {
            const index = prevRes.realtime.findIndex(
              (item) => item.symbol === symbolInfo.symbol
            );
            if (index === -1) {
              newRes.realtime.push(symbolInfo);
            } else {
              newRes.realtime[index] = symbolInfo;
            }
          }
        }

        return { ...prevRes, ...newRes };
      });
    };

    return () => {
      socket.close();
    };
  }, [url]);

  useEffect(() => {
    let allowUpdate = false;
    let newWatchList = watchList.map((itm) => {
      if (!itm.isWatching) {
        sendMessage({
          action: 'subscribe',
          symbol: itm.symbol
        });
        itm.isWatching = true;
        allowUpdate = true;
      }
      return itm;
    });
    if (allowUpdate) {
      setWatchList(newWatchList);
    }
  }, [watchList, sendMessage]);

  return { resFromWS, sendMessage, ws, watchList, setSymbolToWatchList };
};

export default useWebSocket;
