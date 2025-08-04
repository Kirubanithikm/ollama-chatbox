import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MadeWithDyad } from '@/components/made-with-dyad';
import Header from '@/components/Header'; // Import the new Header component

const UserProfilePage = () => {
  const { user, token } = useAuth(); // user and token are still needed for authorization and API calls
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      // If user somehow navigates here without being logged in, redirect
      navigate('/login');
    }
  }, [user, navigate]);

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

  if (!user) {
    return null; // Or a loading spinner, as useEffect will redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header /> {/* Use the new Header component */}

      <main className="flex-1 p-4 overflow-auto flex justify-center items-start">
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
              <Input type="text" value={user.username} readOnly className="bg-gray-50 dark:bg-gray-700" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input type="text" value={user.role} readOnly className="bg-gray-50 dark:bg-gray-700" />
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
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default UserProfilePage;