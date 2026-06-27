const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.tier === 'pro') {
      return res.status(400).json({ error: 'User is already on PRO tier' });
    }

    // Removed STRIPE_PRICE_ID check since we use price_data now
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('dummy')) {
      return res.status(503).json({ error: 'Stripe keys are not fully configured yet.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ConvertHub PRO',
              description: 'Unlimited conversions and pro features',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId.toString(),
      customer_email: user.email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ tier: user.tier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.tier === 'free') return res.status(400).json({ success: false, message: 'You are already on the free tier' });

    // In a real app, we would cancel the subscription on Stripe's side using stripe.subscriptions.cancel(subId)
    // Here we'll simulate the cancellation for demonstration
    user.tier = 'free';
    await user.save();

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!endpointSecret || endpointSecret.includes('dummy')) {
      console.log('Skipping webhook verification because dummy secret is used.');
      event = JSON.parse(req.body.toString());
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, { tier: 'pro' });
      console.log(`User ${userId} upgraded to PRO`);
    }
  }

  res.json({ received: true });
};
