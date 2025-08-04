import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar'; // Import the new Sidebar component
import { MadeWithDyad } from '@/components/made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar /> {/* Render the Sidebar here */}
        <main className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;