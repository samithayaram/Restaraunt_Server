const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

dotenv.config();

const checkData = async () => {
    await connectDB();
    try {
        const users = await User.find({});
        console.log(`--- Users (${users.length}) ---`);
        users.forEach(u => console.log(`ID: ${u._id} | Email: ${u.email} | Name: ${u.name}`));

        const rests = await Restaurant.find({});
        console.log(`\n--- Restaurants (${rests.length}) ---`);
        rests.forEach(r => console.log(`Name: ${r.name} | OwnerID: ${r.owner}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
