// import express from 'express';
// import bcrypt from 'bcryptjs';
// import User from '../models/User.js';
// import { generateToken } from '../middleware/auth.js';

// const router = express.Router();

// // Send verification code (simulated)
// router.post('/send-code', async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({ message: 'Phone number is required' });
//     }

//     // Generate 6-digit verification code
//     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Check if user exists
//     let user = await User.findOne({ phoneNumber });
    
//     if (user) {
//       user.verificationCode = verificationCode;
//       user.verificationExpires = verificationExpires;
//       await user.save();
//     } else {
//       // Create temporary user record
//       user = new User({
//         phoneNumber,
//         username: `user_${Date.now()}`, // Temporary username
//         displayName: 'New User',
//         verificationCode,
//         verificationExpires,
//         isVerified: false
//       });
//       await user.save();
//     }

//     // In production, send SMS here
//     console.log(`Verification code for ${phoneNumber}: ${verificationCode}`);

//     res.json({ 
//       message: 'Verification code sent successfully',
//       // For demo purposes, return the code (remove in production)
//       code: verificationCode
//     });
//   } catch (error) {
//     console.error('Send code error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Verify code and login/register
// router.post('/verify-code', async (req, res) => {
//   try {
//     const { phoneNumber, code, username = "Anurag", displayName = "DEMO"} = req.body;

//     if (!phoneNumber || !code) {
//       return res.status(400).json({ message: 'Phone number and verification code are required' });
//     }

//     const user = await User.findOne({ 
//       phoneNumber, 
//       verificationCode: code,
//       verificationExpires: { $gt: new Date() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired verification code' });
//     }

//     // If this is a new registration, update user details
//     if (!user.isVerified) {
//       if (!username || !displayName) {
//         return res.status(400).json({ message: 'Username and display name are required for new users' });
//       }

//       // Check if username is available
//       const existingUser = await User.findOne({ username: username.toLowerCase() });
//       if (existingUser && existingUser._id.toString() !== user._id.toString()) {
//         return res.status(400).json({ message: 'Username already taken' });
//       }

//       user.username = username.toLowerCase();
//       user.displayName = displayName;
//     }

//     user.isVerified = true;
//     user.verificationCode = null;
//     user.verificationExpires = null;
//     await user.save();

//     const token = generateToken(user._id);

//     res.json({
//       message: 'Authentication successful',
//       token,
//       user: {
//         id: user._id,
//         phoneNumber: user.phoneNumber,
//         username: user.username,
//         displayName: user.displayName,
//         avatar: user.avatar,
//         bio: user.bio
//       }
//     });
//   } catch (error) {
//     console.error('Verify code error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Check username availability
// router.post('/check-username', async (req, res) => {
//   try {
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({ message: 'Username is required' });
//     }

//     const existingUser = await User.findOne({ username: username.toLowerCase() });
    
//     res.json({
//       available: !existingUser,
//       username: username.toLowerCase()
//     });
//   } catch (error) {
//     console.error('Check username error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;


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

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Please enter a valid phone number with country code' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    if (user) {
      // Existing user - update verification code
      user.verificationCode = verificationCode;
      user.verificationExpires = verificationExpires;
      await user.save();

      console.log(`Verification code for existing user ${phoneNumber}: ${verificationCode}`);
    } else {
      // New user - create temporary user record
      const tempUsername = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      user = new User({
        phoneNumber,
        username: tempUsername, // Temporary username that will be replaced
        displayName: 'New User', // Temporary display name
        verificationCode,
        verificationExpires,
        isVerified: false
      });
      await user.save();

      console.log(`Verification code for new user ${phoneNumber}: ${verificationCode}`);
    }

    // In production, send SMS here using services like Twilio
    console.log(`SMS would be sent to ${phoneNumber}: Your TodoChat verification code is ${verificationCode}`);

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
    const { phoneNumber, code, username, displayName } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required' });
    }

    // Find user with valid verification code
    const user = await User.findOne({
      phoneNumber,
      verificationCode: code,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // If username and displayName are provided, this is profile completion
    if (username && displayName) {
      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
        });
      }

      // Check if username is available (excluding current user)
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update user with profile information
      user.username = username.toLowerCase();
      user.displayName = displayName.trim();
      user.isVerified = true;
      user.verificationCode = null;
      user.verificationExpires = null;
      await user.save();

      const token = generateToken(user._id);

      res.json({
        message: 'Profile completed successfully',
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified
        }
      });
    } else {
      // Just verification, check if user needs to complete profile
      if (!user.isVerified || user.displayName === 'New User') {
        // User needs to complete profile
        res.json({
          message: 'Verification successful, please complete your profile',
          user: {
            id: user._id,
            phoneNumber: user.phoneNumber,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            bio: user.bio,
            isVerified: false
          }
        });
      } else {
        // Existing verified user, log them in
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        const token = generateToken(user._id);

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            phoneNumber: user.phoneNumber,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            bio: user.bio,
            isVerified: user.isVerified
          }
        });
      }
    }
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

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.json({
        available: false,
        username: username.toLowerCase(),
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
      });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });

    res.json({
      available: !existingUser,
      username: username.toLowerCase(),
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate username suggestions
router.post('/suggest-username', async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ message: 'Display name is required' });
    }

    const suggestions = await User.generateUsername(displayName);

    res.json({
      suggestions: [suggestions]
    });
  } catch (error) {
    console.error('Username suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;