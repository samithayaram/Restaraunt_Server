const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const connectDB = require('../config/db');

dotenv.config();

const deepCheck = async () => {
    await connectDB();
    try {
        const rest = await Restaurant.findOne({ name: 'Omniebee Restaurant' });
        if (rest) {
            const cats = await Category.find({ restaurant: rest._id });
            const items = await MenuItem.find({ restaurant: rest._id });
            console.log(`Restaurant: ${rest.name}`);
            console.log(`Owner ID: ${rest.owner}`);
            console.log(`Categories: ${cats.length}`);
            console.log(`Menu Items: ${items.length}`);
        } else {
            console.log('Restaurant not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deepCheck();
