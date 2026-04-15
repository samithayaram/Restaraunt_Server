const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const connectDB = require('../config/db');

dotenv.config();

const migrateSubscriptions = async () => {
    await connectDB();
    try {
        const users = await User.find({ role: 'RestaurantOwner' });
        console.log(`Checking ${users.length} owners...`);

        let count = 0;
        for (const user of users) {
            const existing = await Subscription.findOne({ user: user._id });
            if (!existing) {
                await Subscription.create({
                    user: user._id,
                    status: 'active',
                    planType: 'monthly'
                });
                count++;
                console.log(`Created subscription for: ${user.email}`);
            }
        }

        console.log(`Migration complete. Created ${count} new subscriptions.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrateSubscriptions();
