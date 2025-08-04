import { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';
import User from '../models/User';

const router = Router();

// Get all users (Admin/Super Admin only)
router.get('/users', auth, authorize(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching users' }); // Standardized error response
  }
});

// Update user role (Super Admin only)
router.put('/users/:id/role', auth, authorize(['super_admin']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'super_admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully', user: user.username, newRole: user.role });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error updating user role' }); // Standardized error response
  }
});

// Delete user (Super Admin only)
router.delete('/users/:id', auth, authorize(['super_admin']), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user: user.username });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error deleting user' }); // Standardized error response
  }
});

export default router;