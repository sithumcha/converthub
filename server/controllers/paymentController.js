// Payments temporarily disabled
exports.createCheckoutSession = async (req, res) => {
  return res.status(503).json({ 
    success: false, 
    message: "Payments are temporarily unavailable. All features are free during beta testing." 
  });
};

exports.getSubscriptionStatus = async (req, res) => {
  return res.json({ 
    tier: 'free', 
    message: 'All features are free during beta' 
  });
};

exports.handleWebhook = async (req, res) => {
  // Ignore stripe webhooks during beta.
  res.json({ received: true });
};
