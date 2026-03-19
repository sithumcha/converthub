const User = require('../models/User');

const checkUsageLimit = async (req, res, next) => {
  try {
    if (!req.user) return next();

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    const lastDate = user.lastConversionDate ? new Date(user.lastConversionDate) : null;

    let needsSave = false;
    // Reset daily count if it's a new day
    if (lastDate && (now.getDate() !== lastDate.getDate() || now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear())) {
      user.dailyConversions = 0;
      needsSave = true;
    }

    // Reset monthly count if it's a new month
    if (lastDate && (now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear())) {
      user.monthlyConversions = 0;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    // Tier limits
    const limits = {
      free: { daily: 50, monthly: 500 },
      pro: { daily: 100, monthly: 1000 }
    };

    const currentLimits = limits[user.tier] || limits.free;

    if (user.dailyConversions >= currentLimits.daily) {
      console.log(`🚫 User ${user._id} reached daily limit: ${user.dailyConversions}/${currentLimits.daily}`);
      return res.status(403).json({ 
        success: false, 
        message: `Daily limit reached for ${user.tier} tier (${currentLimits.daily} conversions). Upgrade to PRO for higher limits.` 
      });
    }

    if (user.monthlyConversions >= currentLimits.monthly) {
      console.log(`🚫 User ${user._id} reached monthly limit: ${user.monthlyConversions}/${currentLimits.monthly}`);
      return res.status(403).json({ 
        success: false, 
        message: `Monthly limit reached for ${user.tier} tier (${currentLimits.monthly} conversions).` 
      });
    }

    // Attach user model to request for easier updating later
    req.userModel = user;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const incrementUsage = async (req, res, next) => {
  // This is usually called AFTER a successful conversion
  if (!req.userModel) return;

  try {
    req.userModel.dailyConversions += 1;
    req.userModel.monthlyConversions += 1;
    req.userModel.lastConversionDate = new Date();
    await req.userModel.save();
  } catch (err) {
    console.error('Error incrementing usage:', err);
  }
};

module.exports = { checkUsageLimit, incrementUsage };
