const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

dotenv.config();

const updateQrUrls = async () => {
    await connectDB();
    try {
        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants to update.`);

        for (const rest of restaurants) {
            const newQrUrl = `${process.env.CLIENT_URL}/menu/${rest.slug}`;
            rest.qrCodeUrl = newQrUrl;
            await rest.save();
            console.log(`Updated QR Code for: ${rest.name} -> ${newQrUrl}`);
        }

        console.log('All QR codes successfully updated!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating QR codes:', err);
        process.exit(1);
    }
};

updateQrUrls();
