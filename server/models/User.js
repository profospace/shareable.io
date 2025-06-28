import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code']
  },
  username: {
    type: String,
    // required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters long and contain only letters, numbers, and underscores']
  },
  displayName: {
    type: String,
    // required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 160,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  }
}, {
  timestamps: true
});

// Update last active on save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Generate username suggestions
userSchema.statics.generateUsername = async function(displayName) {
  const baseName = displayName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  let username = baseName;
  let counter = 1;

  while (await this.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;
  }

  return username;
};

export default mongoose.model('User', userSchema);