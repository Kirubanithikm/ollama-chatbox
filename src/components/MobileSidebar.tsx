"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, User, Settings, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileSidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onLinkClick: () => void; // Callback to close the sheet
}

const MobileSidebarLink = ({ to, icon: Icon, label, isActive, onLinkClick }: MobileSidebarLinkProps) => {
  return (
    <SheetClose asChild>
      <Link to={to} onClick={onLinkClick} className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </SheetClose>
  );
};

const MobileSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the sheet when a link is clicked
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-64 bg-sidebar-background dark:bg-sidebar-background">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ollama Chat</SheetTitle>
        </SheetHeader>
        <nav className="grid items-start gap-2 mt-4 flex-1">
          <MobileSidebarLink to="/" icon={MessageSquare} label="Chat" isActive={isActive('/')} onLinkClick={handleLinkClick} />
          <MobileSidebarLink to="/profile" icon={User} label="Profile" isActive={isActive('/profile')} onLinkClick={handleLinkClick} />
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <MobileSidebarLink to="/admin" icon={Settings} label="Admin Dashboard" isActive={isActive('/admin')} onLinkClick={handleLinkClick} />
          )}
        </nav>
        <div className="mt-auto p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Welcome, {user?.username}!
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;