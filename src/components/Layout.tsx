import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Outlet } from 'react-router-dom'; // Import Outlet

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-900">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;