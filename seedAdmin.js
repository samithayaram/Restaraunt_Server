const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
    await connectDB();
    try {
        const adminExists = await User.findOne({ email: 'super@admin.com' });
        if (adminExists) {
            console.log('Admin already exists. You can log in with super@admin.com');
            process.exit(0);
        }

        await User.create({
            name: 'Super Admin',
            email: 'super@admin.com',
            password: 'password123',
            role: 'SuperAdmin',
            isActive: true
        });

        console.log('SuperAdmin successfully created! Email: super@admin.com | Password: password123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
