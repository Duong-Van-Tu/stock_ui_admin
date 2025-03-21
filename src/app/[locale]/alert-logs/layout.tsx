import { Metadata } from 'next';
import { ReactNode } from 'react';

interface AlertLogsLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Alert logs',
  description: 'Alert logs page'
};

export default function AlertLogsLayout({ children }: AlertLogsLayoutProps) {
  return children;
}
