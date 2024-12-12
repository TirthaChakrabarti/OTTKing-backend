const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {

    const authHeader = req.header('Authorization');;

    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    jwt.verify(authHeader, 'my_secret_key', (err, verifiedUser) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        
        req.user = verifiedUser;
        next();
    })
}

module.exports = authMiddleware