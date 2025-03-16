import { Metadata } from 'next';
import { ReactNode } from 'react';

interface AlertLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register page'
};

export default function RegisterLayout({ children }: AlertLayoutProps) {
  return children;
}
