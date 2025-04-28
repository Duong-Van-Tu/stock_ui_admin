'use client';
import { createContext } from 'react';
import { message } from 'antd';

type NotificationContextType = {
  notifySuccess: (msg: string) => void;
  notifyError: (msg: string) => void;
  notifyInfo: (msg: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const notifySuccess = (msg: string) => {
    message.success(msg);
  };

  const notifyError = (msg: string) => {
    message.error(msg);
  };

  const notifyInfo = (msg: string) => {
    message.info(msg);
  };

  return (
    <NotificationContext.Provider
      value={{ notifySuccess, notifyError, notifyInfo }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
