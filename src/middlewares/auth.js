import jwt from 'jsonwebtoken';
const JWT_SECRET = 'your_jwt_secret';
import User from '../models/user_model.js';


const authenticateJWT = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ code: "authentication_failed", error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async(err, decoded) => {
        if (err) {
            return res.status(401).json({ code: "authentication_failed", error: 'Failed to authenticate token' });
        }

        req.userId = decoded.id;

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(401).json({ code: "authentication_failed", error: 'Failed to authenticate token' });
        }
        req.role = decoded.role;
        console.log("decoded :: ", decoded)
        next();
    });
};

export default authenticateJWT;
