import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import MobileSidebar from './MobileSidebar'; // Import MobileSidebar

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center">
        <MobileSidebar /> {/* Mobile sidebar trigger */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 ml-4 md:ml-0">Ollama Chat</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 dark:text-gray-300 hidden md:inline">Welcome, {user?.username}!</span>
        <ThemeToggle />
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;