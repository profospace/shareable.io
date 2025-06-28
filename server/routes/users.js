import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// // Search users
// router.get('/search', async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q || q.length < 2) {
//       return res.status(400).json({ message: 'Search query must be at least 2 characters' });
//     }

//     const users = await User.find({
//       $and: [
//         { _id: { $ne: req.user._id } }, // Exclude current user
//         {
//           $or: [
//             { username: { $regex: q, $options: 'i' } },
//             { displayName: { $regex: q, $options: 'i' } }
//           ]
//         }
//       ]
//     })
//     .select('username displayName avatar bio lastActive')
//     .limit(10);

//     res.json(users);
//   } catch (error) {
//     console.error('Search users error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    // Validate search query
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Sanitize and validate pagination parameters
    const limitNum = Math.min(parseInt(limit) || 10, 50); // Max 50 results
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    // Create search conditions
    const searchConditions = {
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isVerified: true }, // Only show verified users (optional)
        {
          $or: [
            { username: { $regex: trimmedQuery, $options: 'i' } },
            { displayName: { $regex: trimmedQuery, $options: 'i' } }
          ]
        }
      ]
    };

    // Add privacy filter - only show public profiles or handle private profiles logic
    if (req.query.includePrivate !== 'true') {
      searchConditions.$and.push({ 'settings.privacy': 'public' });
    }

    // Execute search with better error handling
    const [users, totalCount] = await Promise.all([
      User.find(searchConditions)
        .select('username displayName avatar bio lastActive settings.privacy')
        .sort({
          // Prioritize exact matches, then by last active
          username: 1,
          lastActive: -1
        })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance

      User.countDocuments(searchConditions)
    ]);

    // Format response
    const formattedUsers = users.map(user => ({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar || '',
      bio: user.bio || '',
      lastActive: user.lastActive,
      isPrivate: user.settings?.privacy === 'private'
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalResults: totalCount,
          hasNextPage: skip + limitNum < totalCount,
          hasPrevPage: pageNum > 1
        },
        query: trimmedQuery
      }
    });

  } catch (error) {
    console.error('Search users error:', error);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      ...(isDevelopment && { error: error.message })
    });
  }
});

// Alternative: More advanced search with text indexing
// First, add text index to your User schema:
/*
userSchema.index({
  username: 'text',
  displayName: 'text',
  bio: 'text'
}, {
  weights: {
    username: 10,
    displayName: 5,
    bio: 1
  }
});
*/

// Advanced search route using text search
router.get('/search-advanced', async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const trimmedQuery = q.trim();
    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    // Use MongoDB text search for better relevance
    const searchConditions = {
      $and: [
        // { _id: { $ne: req.user._id } },
        { isVerified: true },
        { 'settings.privacy': 'public' },
        { $text: { $search: trimmedQuery } }
      ]
    };

    const users = await User.find(searchConditions, {
      score: { $meta: 'textScore' } // Include relevance score
    })
      .select('username displayName avatar bio lastActive')
      .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar || '',
          bio: user.bio || '',
          lastActive: user.lastActive,
          relevanceScore: user.score // Include relevance score
        })),
        query: trimmedQuery
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Get user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ 
      username: username.toLowerCase() 
    }).select('username displayName avatar bio lastActive createdAt settings.privacy');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (user.settings.privacy === 'private' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile',authenticateToken ,async (req, res) => {
  try {
    const { displayName, bio, avatar, settings } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      settings: user.settings
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-verificationCode -verificationExpires');
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;