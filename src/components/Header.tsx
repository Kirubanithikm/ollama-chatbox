import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ollama Chat</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 dark:text-gray-300">Welcome, {user?.username}!</span>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <Link to="/admin">
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
        )}
        <Link to="/profile">
          <Button variant="outline">Profile</Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
          <Label htmlFor="dark-mode">Dark Mode</Label>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;