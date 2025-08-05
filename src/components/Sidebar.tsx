"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageSquare, User, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

const SidebarLink = ({ to, icon: Icon, label, isActive }: SidebarLinkProps) => {
  return (
    <Link to={to} className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
    )}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar-background p-4 dark:bg-sidebar-background dark:border-sidebar-border">
      <div className="flex-1">
        <nav className="grid items-start gap-2">
          <SidebarLink to="/" icon={MessageSquare} label="Chat" isActive={isActive('/')} />
          {user && (
            <>
              {/* Placeholder for Profile and Admin Dashboard links */}
              {/* <SidebarLink to="/profile" icon={User} label="Profile" isActive={isActive('/profile')} /> */}
              {/* {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <SidebarLink to="/admin" icon={Settings} label="Admin Dashboard" isActive={isActive('/admin')} />
              )} */}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;