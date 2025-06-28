import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Send verification code (simulated)
router.post('/send-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    
    if (user) {
      user.verificationCode = verificationCode;
      user.verificationExpires = verificationExpires;
      await user.save();
    } else {
      // Create temporary user record
      user = new User({
        phoneNumber,
        username: `user_${Date.now()}`, // Temporary username
        displayName: phoneNumber,
        verificationCode,
        verificationExpires,
        isVerified: false
      });
      await user.save();
    }

    // In production, send SMS here
    console.log(`Verification code for ${phoneNumber}: ${verificationCode}`);

    res.json({ 
      message: 'Verification code sent successfully',
      // For demo purposes, return the code (remove in production)
      code: verificationCode
    });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify code and login/register
router.post('/verify-code', async (req, res) => {
  try {
    const { phoneNumber, code, username = "Anurag", displayName = "DEMO"} = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required' });
    }

    const user = await User.findOne({ 
      phoneNumber, 
      verificationCode: code,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // If this is a new registration, update user details
    if (!user.isVerified) {
      if (!username || !displayName) {
        return res.status(400).json({ message: 'Username and display name are required for new users' });
      }

      // Check if username is available
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      user.username = username.toLowerCase();
      user.displayName = displayName;
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check username availability
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    
    res.json({
      available: !existingUser,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;