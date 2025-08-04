import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';

const AdminProtectedRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If not authenticated at all, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    // If authenticated but not admin/super_admin, show error and redirect to home
    toast.error('Access Denied: You do not have administrative privileges.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;