const History = require('../models/History');
const User = require('../models/User');

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get recent history
    const history = await History.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
      
    // Get stats (e.g. conversions per day for the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const stats = await History.aggregate([
      { $match: { userId: userId /* Need ObjectId cast normally, but assuming middleware passes String */, createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format stats for Recharts
    const chartData = stats.map(item => ({
      date: item._id,
      conversions: item.count
    }));

    res.json({ success: true, history, chartData });
  } catch (error) {
    next(error);
  }
};

const recordHistory = async (userId, action, fileType, fileName) => {
  try {
    if (!userId) return;
    await History.create({ userId, action, fileType, fileName });
  } catch (error) {
    console.error('Failed to record history:', error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select('-password');

    res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Google authenticated users might not have a password
    if (!user.password && !currentPassword) {
       user.password = newPassword;
       await user.save();
       return res.json({ success: true, message: 'Password set successfully' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  recordHistory,
  updateProfile,
  updatePassword
};
