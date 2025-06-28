// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   phoneNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     match: [/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code']
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters long and contain only letters, numbers, and underscores']
//   },
//   displayName: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 50
//   },
//   avatar: {
//     type: String,
//     default: ''
//   },
//   bio: {
//     type: String,
//     maxlength: 160,
//     default: ''
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   verificationCode: {
//     type: String,
//     default: null
//   },
//   verificationExpires: {
//     type: Date,
//     default: null
//   },
//   lastActive: {
//     type: Date,
//     default: Date.now
//   },
//   settings: {
//     notifications: {
//       type: Boolean,
//       default: true
//     },
//     privacy: {
//       type: String,
//       enum: ['public', 'private'],
//       default: 'public'
//     }
//   }
// }, {
//   timestamps: true
// });

// // Update last active on save
// userSchema.pre('save', function(next) {
//   this.lastActive = new Date();
//   next();
// });

// // Generate username suggestions
// userSchema.statics.generateUsername = async function(displayName) {
//   const baseName = displayName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
//   let username = baseName;
//   let counter = 1;

//   while (await this.findOne({ username })) {
//     username = `${baseName}${counter}`;
//     counter++;
//   }

//   return username;
// };

// export default mongoose.model('User', userSchema);



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
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters long and contain only letters, numbers, and underscores']
  },
  displayName: {
    type: String,
    required: true,
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

// Indexes for better performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ username: 1 });
userSchema.index({ verificationCode: 1 });

// Update last active on save
userSchema.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

// Generate username suggestions based on display name
userSchema.statics.generateUsername = async function (displayName) {
  // Clean the display name to create a base username
  const baseName = displayName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .substring(0, 15); // Limit length

  if (baseName.length < 3) {
    // If cleaned name is too short, use a default base
    const defaultBase = 'user';
    let username = defaultBase;
    let counter = Math.floor(Math.random() * 1000);

    while (await this.findOne({ username })) {
      username = `${defaultBase}${counter}`;
      counter++;
    }

    return username;
  }

  let username = baseName;
  let counter = 1;

  // Check if base username is available
  while (await this.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;

    // Prevent infinite loop
    if (counter > 9999) {
      username = `${baseName}${Math.floor(Math.random() * 100000)}`;
      break;
    }
  }

  return username;
};

// Method to check if username is available
userSchema.statics.isUsernameAvailable = async function (username, excludeUserId = null) {
  const query = { username: username.toLowerCase() };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await this.findOne(query);
  return !existingUser;
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function () {
  return {
    id: this._id,
    phoneNumber: this.phoneNumber,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bio: this.bio,
    isVerified: this.isVerified,
    lastActive: this.lastActive,
    settings: this.settings,
    createdAt: this.createdAt
  };
});

export default mongoose.model('User', userSchema);