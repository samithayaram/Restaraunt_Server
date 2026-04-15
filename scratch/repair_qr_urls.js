const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

dotenv.config();

const fixQrUrls = async () => {
    await connectDB();
    try {
        const restaurants = await Restaurant.find({ qrCodeUrl: /localhost/ });
        console.log(`Found ${restaurants.length} restaurants with localhost URLs.`);

        let count = 0;
        const PRODUCTION_URL = 'https://restaraunt-saas.vercel.app';

        for (const res of restaurants) {
            const newUrl = res.qrCodeUrl.replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);
            res.qrCodeUrl = newUrl;
            await res.save();
            count++;
            console.log(`Fixed URL for: ${res.name} -> ${newUrl}`);
        }

        console.log(`Migration complete. Fixed ${count} URLs.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixQrUrls();
