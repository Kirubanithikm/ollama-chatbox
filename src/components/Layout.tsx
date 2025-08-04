import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;