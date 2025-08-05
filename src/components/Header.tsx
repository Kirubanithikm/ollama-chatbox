import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import MobileSidebar from './MobileSidebar';

const Header = () => {
  // Removed useAuth and handleLogout as authentication will be re-implemented with Supabase

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center">
        <MobileSidebar />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 ml-4 md:ml-0">Ollama Chat</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Temporarily removed user welcome and logout button */}
        <ThemeToggle />
        {/* <Button onClick={handleLogout} variant="outline">
          Logout
        </Button> */}
      </div>
    </header>
  );
};

export default Header;