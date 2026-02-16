const jwt = require('jsonwebtoken');
const JWT_SECRET = 'bardzotajnykluczjwt123'

const auth = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err){
            return res.status(403).json({ message: "Invalid token"})
        }
        req.user = decodedUser;

        next();
    })
};

module.exports = auth;
