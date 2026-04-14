const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');

exports.createCheckoutSession = async (req, res) => {
    try {
        // Price ID should come from a DB or directly from client
        const { priceId } = req.body;
        
        let sub = await Subscription.findOne({ user: req.user.id });
        let customerId;

        if (sub && sub.stripeCustomerId) {
            customerId = sub.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({
                email: req.user.email,
                metadata: { userId: req.user.id }
            });
            customerId = customer.id;
            
            if (sub) {
                sub.stripeCustomerId = customerId;
                await sub.save();
            } else {
                await Subscription.create({ user: req.user.id, stripeCustomerId: customerId });
            }
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard/billing`,
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.dummyCheckout = async (req, res) => {
    try {
        let sub = await Subscription.findOne({ user: req.user.id });
        if (!sub) {
            sub = new Subscription({ user: req.user.id });
        }
        sub.status = 'active';
        sub.planType = 'monthly';
        await sub.save();
        
        res.status(200).json({ success: true, message: 'Dummy payment successful!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.stripeWebhook = async (req, res) => {
    let event;
    try {
        const sig = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscriptionInfo = event.data.object;
        
        const customerId = subscriptionInfo.customer;
        const subRecord = await Subscription.findOne({ stripeCustomerId: customerId });
        
        if (subRecord) {
            subRecord.stripeSubscriptionId = subscriptionInfo.id;
            subRecord.status = subscriptionInfo.status;
            subRecord.currentPeriodStart = new Date(subscriptionInfo.current_period_start * 1000);
            subRecord.currentPeriodEnd = new Date(subscriptionInfo.current_period_end * 1000);
            subRecord.cancelAtPeriodEnd = subscriptionInfo.cancel_at_period_end;
            await subRecord.save();
        }
    } else if (event.type === 'customer.subscription.deleted') {
        const subscriptionInfo = event.data.object;
        const customerId = subscriptionInfo.customer;
        const subRecord = await Subscription.findOne({ stripeCustomerId: customerId });
        
        if (subRecord) {
            subRecord.status = 'canceled';
            subRecord.stripeSubscriptionId = null;
            await subRecord.save();
        }
    }

    res.json({ received: true });
};
