import { Metadata } from 'next';
import { ReactNode } from 'react';

interface AlertLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Alert logs',
  description: 'Alert logs page'
};

export default function AlertLogsLayout({ children }: AlertLayoutProps) {
  return children;
}
