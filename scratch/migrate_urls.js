const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant');

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants. Checking for localhost URLs...`);

        let updatedCount = 0;
        const NEW_CLIENT_URL = 'https://restaraunt-saas.vercel.app';

        for (const rest of restaurants) {
            if (rest.qrCodeUrl && rest.qrCodeUrl.includes('localhost')) {
                const newUrl = rest.qrCodeUrl.replace(/http:\/\/localhost:\d+/, NEW_CLIENT_URL);
                rest.qrCodeUrl = newUrl;
                await rest.save();
                console.log(`Updated: ${rest.name} -> ${newUrl}`);
                updatedCount++;
            }
        }

        console.log(`Migration completed. Updated ${updatedCount} restaurants.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
