const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, 'Mohamed_Awad');
        req.user = decoded;
        console.log(req.user)
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = auth;
