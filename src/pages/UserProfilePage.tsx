import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const UserProfilePage = () => {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // No need for useEffect to redirect, ProtectedRoute handles it.
  // The 'user' object will always be available here due to ProtectedRoute.

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error('All password fields are required.');
      return;
    }

    setLoading(true);
    try {
      await api('/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
        token: token || undefined,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      // toast.error is handled by the api utility
    } finally {
      setLoading(false);
    }
  };

  // User will always be defined here because of ProtectedRoute
  // if (!user) {
  //   return null; // Or a loading spinner, as useEffect will redirect
  // }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]"> {/* Adjust height to fit within Layout's main */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Your Profile</CardTitle>
          <CardDescription className="text-center">
            View your details and manage your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input type="text" value={user?.username || ''} readOnly className="bg-gray-50 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input type="text" value={user?.role || ''} readOnly className="bg-gray-50 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;