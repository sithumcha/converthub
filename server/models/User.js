const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: { type: Date, default: Date.now },
  tier: { type: String, enum: ['free', 'pro'], default: 'free', index: true },
  dailyConversions: { type: Number, default: 0 },
  monthlyConversions: { type: Number, default: 0 },
  lastConversionDate: { type: Date },
  storage: {
    total: { type: Number, default: 0 },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
  },
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'past_due'],
    default: 'inactive',
    index: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
