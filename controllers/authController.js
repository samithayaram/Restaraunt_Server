const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'none',
        secure: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name, email, password, role: role || 'RestaurantOwner'
        });
        
        // If it's a restaurant owner, maybe create an initial empty subscription record
        if (user.role === 'RestaurantOwner') {
            await Subscription.create({ 
                user: user._id, 
                status: 'incomplete', 
                planType: 'monthly' 
            });
        }

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let subscription = await Subscription.findOne({ user: req.user.id });
        
        // Auto-create subscription if missing (Set to 'incomplete' so they see the paywall once)
        if (!subscription && user.role === 'RestaurantOwner') {
            subscription = await Subscription.create({
                user: user._id,
                status: 'incomplete', 
                planType: 'monthly'
            });
        }

        res.status(200).json({
            success: true,
            data: { user, subscription }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
    
    res.status(200).json({ success: true, data: {} });
};
