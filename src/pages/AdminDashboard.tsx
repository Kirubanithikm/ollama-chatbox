import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
}

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api('/admin/users', {
          method: 'GET',
          token: token || undefined,
        });
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users.');
        toast.error(err.message || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]); // Only token is needed here, user role check is in AdminProtectedRoute

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    if (user?.role !== 'super_admin') {
      toast.error('Only Super Admins can change roles.');
      return;
    }
    try {
      await api(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
        token: token || undefined,
      });
      setUsers(prevUsers =>
        prevUsers.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (user?.role !== 'super_admin') {
      toast.error('Only Super Admins can delete users.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api(`/admin/users/${userId}`, {
          method: 'DELETE',
          token: token || undefined,
        });
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        toast.success('User deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered On</TableHead>
              {user?.role === 'super_admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell>
                  {user?.role === 'super_admin' ? (
                    <Select value={u.role} onValueChange={(value: 'user' | 'admin' | 'super_admin') => handleRoleChange(u._id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    u.role
                  )}
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                {user?.role === 'super_admin' && (
                  <TableCell className="text-right">
                    {u._id !== user.id && ( // Prevent super admin from deleting themselves
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u._id)}>
                        Delete
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;