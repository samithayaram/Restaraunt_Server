const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

dotenv.config();

const fixOwnership = async () => {
    await connectDB();
    try {
        const targetUser = await User.findOne({ email: 'samithayaram@gmail.com' });
        if (!targetUser) {
            console.error('User samithayaram@gmail.com not found. Please log in once to create the account.');
            process.exit(1);
        }

        const rest = await Restaurant.findOne({ name: 'Omniebee Restaurant' });
        if (!rest) {
            console.log('Omniebee Restaurant not found.');
            process.exit(1);
        }

        console.log(`Current Owner ID: ${rest.owner}`);
        console.log(`New Owner ID: ${targetUser._id} (${targetUser.email})`);

        rest.owner = targetUser._id;
        await rest.save();

        console.log('Ownership successfully transferred!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixOwnership();
