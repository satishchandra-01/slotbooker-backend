import jwt from 'jsonwebtoken';
const JWT_SECRET = 'your_jwt_secret';

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log("check :: ", req.headers)

    if (!token) {
        return res.status(403).json({ code: "authentication_failed", error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ code: "authentication_failed", error: 'Failed to authenticate token' });
        }

        req.userId = decoded.id;
        console.log("decoded :: ", decoded)
        next();
    });
};

export default authenticateJWT;
