import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import auth from '../middleware/auth'; // Import auth middleware
import bcrypt from 'bcryptjs'; // Import bcrypt for password comparison/hashing

const router = Router();

// Register User
router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      password,
      role: 'user', // Default role for new registrations
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token, 
          message: 'User registered successfully',
          user: { // Include user details in the response
            id: user.id,
            username: user.username,
            role: user.role,
          }
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during registration' }); // Standardized error response
  }
});

// Login User
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // Return user details along with the token
        res.json({ 
          token, 
          message: 'Logged in successfully',
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          }
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during login' }); // Standardized error response
  }
});

// Get current user details (Protected)
router.get('/me', auth, async (req: Request, res: Response) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user?.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching user details' }); // Standardized error response
  }
});

// Update current user's password (Protected)
router.put('/me/password', auth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // The pre-save hook in the User model will hash the new password
    user.password = newPassword; 
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error updating password' }); // Standardized error response
  }
});

export default router;