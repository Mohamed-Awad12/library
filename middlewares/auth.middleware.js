const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Mohamed_Awad');
        
        // Check if user exists and is not blocked
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).send({ message: 'User not found' });
        }
        
        if (user.isBlocked) {
            return res.status(403).send({ message: 'Account has been blocked' });
        }
        
        // Store the full user object instead of just the decoded token
        req.user = user;
        console.log(req.user)
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = auth;
